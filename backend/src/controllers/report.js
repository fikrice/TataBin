import db from '../models/index.js';
import ExcelJS from 'exceljs';

const { TransactionLog, Asset, StorageBin, Supplier, User, Warehouse } = db;

/**
 * Controller Laporan (ReportController)
 * Mengelola riwayat log transaksi dan ekspor laporan ke Excel.
 */
class ReportController {

  /**
   * Mengambil daftar log transaksi dengan filter tanggal, tipe, dan pencarian
   * @param {object} req - Request query: { type, startDate, endDate, search }
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getLogs(req, res, next) {
    try {
      const { type, startDate, endDate, search } = req.query;
      const whereClause = {};

      if (type && ['inbound', 'outbound'].includes(type)) {
        whereClause.type = type;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[db.Sequelize.Op.gte] = new Date(startDate + ' 00:00:00');
        }
        if (endDate) {
          whereClause.createdAt[db.Sequelize.Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      if (search && search.trim() !== '') {
        whereClause.referenceNumber = {
          [db.Sequelize.Op.iLike]: `%${search}%`
        };
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await TransactionLog.findAndCountAll({
        where: whereClause,
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin', include: [{ model: Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' },
          { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Log transaksi berhasil dimuat',
        data: rows,
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
   * @param {object} req - Request query (filter yang sama dengan getLogs)
   * @param {object} res - Response stream file Excel
   * @param {function} next - Error handler
   */
  static async exportExcel(req, res, next) {
    try {
      const { type, startDate, endDate, search } = req.query;
      const whereClause = {};

      if (type && ['inbound', 'outbound'].includes(type)) {
        whereClause.type = type;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[db.Sequelize.Op.gte] = new Date(startDate + ' 00:00:00');
        }
        if (endDate) {
          whereClause.createdAt[db.Sequelize.Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      if (search && search.trim() !== '') {
        whereClause.referenceNumber = {
          [db.Sequelize.Op.iLike]: `%${search}%`
        };
      }

      const logs = await TransactionLog.findAll({
        where: whereClause,
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin', include: [{ model: Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' },
          { model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Membuat workbook baru menggunakan exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Log Transaksi WMS');

      // Tentukan kolom worksheet beserta lebarnya
      worksheet.columns = [
        { header: 'No. Referensi', key: 'referenceNumber', width: 25 },
        { header: 'Tanggal & Waktu', key: 'createdAt', width: 22 },
        { header: 'Tipe', key: 'type', width: 12 },
        { header: 'Nama Aset', key: 'assetName', width: 25 },
        { header: 'SKU', key: 'assetCode', width: 15 },
        { header: 'Gudang', key: 'warehouseName', width: 20 },
        { header: 'Slot Bin', key: 'binCode', width: 12 },
        { header: 'Kuantitas (Unit)', key: 'quantity', width: 15 },
        { header: 'Harga Satuan', key: 'price', width: 18 },
        { header: 'Total Nilai', key: 'totalValue', width: 20 },
        { header: 'Pemasok (Inbound)', key: 'supplierName', width: 25 },
        { header: 'Petugas', key: 'userFullName', width: 20 }
      ];

      // Format header style (mempercantik baris pertama)
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' } // Warna biru tua industrial
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Isi baris data log transaksi
      logs.forEach(log => {
        const qty = Number(log.quantity);
        const price = Number(log.price);
        const total = qty * price;

        worksheet.addRow({
          referenceNumber: log.referenceNumber,
          createdAt: new Date(log.createdAt).toLocaleString('id-ID'),
          type: log.type === 'inbound' ? 'MASUK' : 'KELUAR',
          assetName: log.asset?.name || '–',
          assetCode: log.asset?.code || '–',
          warehouseName: log.storageBin?.warehouse?.name || '–',
          binCode: log.storageBin?.code || '–',
          quantity: qty,
          price: price,
          totalValue: total,
          supplierName: log.supplier?.name || '–',
          userFullName: log.user?.fullName || log.user?.username || '–'
        });
      });

      // Format angka keuangan untuk kolom Harga Satuan & Total Nilai
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Kolom 8 (Kuantitas) diset rata tengah
          row.getCell(8).alignment = { horizontal: 'center' };
          
          // Kolom 9 (Harga) & Kolom 10 (Total) diformat mata uang
          row.getCell(9).numFmt = '"Rp"#,##0.00';
          row.getCell(10).numFmt = '"Rp"#,##0.00';

          // Pewarnaan teks berdasarkan tipe transaksi (Hijau untuk Masuk, Merah untuk Keluar)
          const typeCell = row.getCell(3);
          if (typeCell.value === 'MASUK') {
            typeCell.font = { color: { argb: '15803D' }, bold: true };
          } else {
            typeCell.font = { color: { argb: 'B91C1C' }, bold: true };
          }
        }
      });

      // Set header response untuk mengunduh berkas attachment
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Log_Transaksi_WMS_${Date.now()}.xlsx`
      );

      // Tulis file workbook langsung ke stream response
      await workbook.xlsx.write(res);
      return res.end();

    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
