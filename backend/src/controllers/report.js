import db from '../models/index.js';
import ExcelJS from 'exceljs';

const { WorkOrderScan, WorkOrder, Asset, StorageBin, Supplier, User, Warehouse } = db;
const { Op } = db.Sequelize;

/**
 * Controller Laporan (ReportController)
 * Mengelola riwayat log scan label dan ekspor laporan ke Excel.
 */
class ReportController {

  /**
   * Mengambil daftar log scan label dengan filter tanggal, tipe, dan pencarian
   */
  static async getLogs(req, res, next) {
    try {
      const { type, startDate, endDate, search } = req.query;
      const whereClause = {};

      if (type && ['inbound', 'outbound'].includes(type)) {
        whereClause.type = type;
      }

      if (startDate || endDate) {
        whereClause.scannedAt = {};
        if (startDate) {
          whereClause.scannedAt[Op.gte] = new Date(startDate + ' 00:00:00');
        }
        if (endDate) {
          whereClause.scannedAt[Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      if (search && search.trim() !== '') {
        whereClause[Op.or] = [
          { labelCode: { [Op.iLike]: `%${search}%` } },
          { '$workOrder.code$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await WorkOrderScan.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: WorkOrder,
            as: 'workOrder',
            include: [
              { model: Warehouse, as: 'warehouse' },
              { model: StorageBin, as: 'storageBin' },
              { model: Asset, as: 'asset', include: [{ model: Supplier, as: 'supplier' }] }
            ]
          },
          { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ],
        limit,
        offset,
        order: [['scannedAt', 'DESC']]
      });

      // Map data to match frontend expectations
      const mappedRows = rows.map(scan => {
        const wo = scan.workOrder || {};
        const asset = wo.asset || {};
        return {
          id: scan.id,
          referenceNumber: wo.code || '–',
          labelCode: scan.labelCode,
          createdAt: scan.scannedAt,
          type: scan.type,
          quantity: 1,
          price: asset.price || 0,
          updatedStock: scan.updatedStock,
          remarks: wo.remarks || '',
          asset: {
            code: asset.code || '–',
            name: asset.name || '–'
          },
          storageBin: {
            code: wo.storageBin?.code || '–',
            warehouse: {
              name: wo.warehouse?.name || '–'
            }
          },
          supplier: {
            name: asset.supplier?.name || '–'
          },
          user: {
            username: scan.user?.username || '–',
            fullName: scan.user?.fullName || '–'
          }
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Log transaksi berhasil dimuat',
        data: mappedRows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengekspor log transaksi ke file Excel menggunakan exceljs
   */
  static async exportExcel(req, res, next) {
    try {
      const { type, startDate, endDate, search } = req.query;
      const whereClause = {};

      if (type && ['inbound', 'outbound'].includes(type)) {
        whereClause.type = type;
      }

      if (startDate || endDate) {
        whereClause.scannedAt = {};
        if (startDate) {
          whereClause.scannedAt[Op.gte] = new Date(startDate + ' 00:00:00');
        }
        if (endDate) {
          whereClause.scannedAt[Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      if (search && search.trim() !== '') {
        whereClause[Op.or] = [
          { labelCode: { [Op.iLike]: `%${search}%` } },
          { '$workOrder.code$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      const scans = await WorkOrderScan.findAll({
        where: whereClause,
        include: [
          {
            model: WorkOrder,
            as: 'workOrder',
            include: [
              { model: Warehouse, as: 'warehouse' },
              { model: StorageBin, as: 'storageBin' },
              { model: Asset, as: 'asset', include: [{ model: Supplier, as: 'supplier' }] }
            ]
          },
          { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ],
        order: [['scannedAt', 'DESC']]
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Log Transaksi WMS');

      // 11 Columns as specified in PDF
      worksheet.columns = [
        { header: 'Work Order Number', key: 'woNumber', width: 25 },
        { header: 'WO Category', key: 'woCategory', width: 15 },
        { header: 'Warehouse Name', key: 'warehouseName', width: 20 },
        { header: 'Storage Bin Address', key: 'binCode', width: 20 },
        { header: 'Asset Name', key: 'assetName', width: 25 },
        { header: 'Supplier Name', key: 'supplierName', width: 25 },
        { header: 'Remarks', key: 'remarks', width: 25 },
        { header: 'Label Code', key: 'labelCode', width: 25 },
        { header: 'Scanned At', key: 'scannedAt', width: 22 },
        { header: 'Scanned By', key: 'scannedBy', width: 20 },
        { header: 'Updated Stock', key: 'updatedStock', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      scans.forEach(scan => {
        const wo = scan.workOrder || {};
        const asset = wo.asset || {};
        worksheet.addRow({
          woNumber: wo.code || '–',
          woCategory: scan.type === 'inbound' ? 'INBOUND' : 'OUTBOUND',
          warehouseName: wo.warehouse?.name || '–',
          binCode: wo.storageBin?.code || '–',
          assetName: asset.name || '–',
          supplierName: scan.type === 'inbound' ? (asset.supplier?.name || '–') : '–',
          remarks: wo.remarks || '–',
          labelCode: scan.labelCode,
          scannedAt: new Date(scan.scannedAt).toLocaleString('id-ID'),
          scannedBy: scan.user?.fullName || scan.user?.username || '–',
          updatedStock: scan.updatedStock
        });
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.getCell(11).alignment = { horizontal: 'center' };
          const typeCell = row.getCell(2);
          if (typeCell.value === 'INBOUND') {
            typeCell.font = { color: { argb: '15803D' }, bold: true };
          } else {
            typeCell.font = { color: { argb: 'B91C1C' }, bold: true };
          }
        }
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Log_Transaksi_WMS_${Date.now()}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();

    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
