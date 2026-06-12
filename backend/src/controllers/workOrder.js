import db from '../models/index.js';

const { WorkOrder, WorkOrderScan, Warehouse, StorageBin, Asset, Stock, Supplier, User, sequelize } = db;
const { Op } = db.Sequelize;

class WorkOrderController {

  /**
   * Mengambil daftar work orders
   */
  static async getAll(req, res, next) {
    try {
      const { type, status } = req.query;
      const whereClause = {};

      if (type) {
        whereClause.type = type;
      }
      if (status) {
        whereClause.status = status;
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await WorkOrder.findAndCountAll({
        where: whereClause,
        include: [
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
          { model: StorageBin, as: 'storageBin', attributes: ['id', 'code', 'category'] },
          { model: Asset, as: 'asset', attributes: ['id', 'name', 'code', 'category'] }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Daftar Work Order berhasil dimuat',
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
   * Mengambil detail work order berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const wo = await WorkOrder.findByPk(id, {
        include: [
          { model: Warehouse, as: 'warehouse' },
          { model: StorageBin, as: 'storageBin' },
          { model: Asset, as: 'asset', include: [{ model: Supplier, as: 'supplier' }] },
          {
            model: WorkOrderScan,
            as: 'scans',
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName'] }]
          }
        ]
      });

      if (!wo) {
        return res.status(404).json({
          success: false,
          message: 'Work Order tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Detail Work Order berhasil dimuat',
        data: wo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Membuat Work Order baru (Admin Only)
   */
  static async create(req, res, next) {
    try {
      const { type, warehouseId, storageBinId, assetId, quantity, remarks } = req.body;
      const errors = {};

      if (!type || !['inbound', 'outbound'].includes(type)) {
        errors.type = ['Tipe Work Order wajib dipilih (inbound/outbound)'];
      }
      if (!warehouseId) {
        errors.warehouseId = ['Gudang wajib dipilih'];
      }
      if (!storageBinId) {
        errors.storageBinId = ['Slot penyimpanan wajib dipilih'];
      }
      if (!assetId) {
        errors.assetId = ['Aset wajib dipilih'];
      }
      if (!quantity || quantity <= 0) {
        errors.quantity = ['Jumlah barang harus lebih dari 0'];
      }

      // Validasi Gudang
      let warehouse = null;
      if (warehouseId) {
        warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) errors.warehouseId = ['Gudang tidak valid'];
      }

      // Validasi Bin
      let bin = null;
      if (storageBinId) {
        bin = await StorageBin.findByPk(storageBinId);
        if (!bin) {
          errors.storageBinId = ['Slot penyimpanan tidak valid'];
        } else if (warehouseId && bin.warehouseId !== warehouseId) {
          errors.storageBinId = ['Slot penyimpanan tidak berada di gudang yang dipilih'];
        }
      }

      // Validasi Aset
      let asset = null;
      if (assetId) {
        asset = await Asset.findByPk(assetId);
        if (!asset) {
          errors.assetId = ['Aset tidak valid'];
        } else if (bin && bin.assetId !== assetId) {
          errors.assetId = ['Aset tidak cocok dengan alokasi pada slot penyimpanan'];
        }
      }

      // Validasi ketersediaan stok untuk Outbound WO
      if (type === 'outbound' && assetId && storageBinId && quantity > 0) {
        const stock = await Stock.findOne({ where: { assetId, storageBinId } });
        const availableQty = stock ? stock.quantity : 0;
        if (quantity > availableQty) {
          errors.quantity = [`Stok tidak mencukupi. Tersedia di bin ini: ${availableQty} unit`];
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      // Auto-generate code: WO_IN_Count2digit atau WO_OUT_Count2digit
      const prefix = type === 'inbound' ? 'WO_IN' : 'WO_OUT';
      const count = await WorkOrder.count({ where: { type } });
      const code = `${prefix}_${String(count + 1).padStart(2, '0')}`;

      const newWO = await WorkOrder.create({
        code,
        type,
        warehouseId,
        storageBinId,
        assetId,
        quantity,
        status: 'To-Do',
        remarks
      });

      return res.status(201).json({
        success: true,
        message: 'Work Order baru berhasil dibuat',
        data: newWO
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus Work Order (Admin Only)
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const wo = await WorkOrder.findByPk(id);

      if (!wo) {
        return res.status(404).json({
          success: false,
          message: 'Work Order tidak ditemukan'
        });
      }

      if (wo.status !== 'To-Do') {
        return res.status(400).json({
          success: false,
          message: 'Work Order yang sedang berjalan atau sudah selesai tidak dapat dihapus'
        });
      }

      await wo.destroy();

      return res.status(200).json({
        success: true,
        message: 'Work Order berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil daftar label berikutnya untuk dicetak (Inbound)
   */
  static async getNextLabels(req, res, next) {
    try {
      const { id } = req.params;
      const wo = await WorkOrder.findByPk(id, {
        include: [{ model: Asset, as: 'asset' }]
      });

      if (!wo) {
        return res.status(404).json({ success: false, message: 'Work Order tidak ditemukan' });
      }

      // Dapatkan jumlah total label yang sudah masuk untuk aset ini
      const globalScannedInbound = await WorkOrderScan.count({
        where: {
          type: 'inbound',
          labelCode: { [Op.like]: `${wo.asset.code}_%` }
        }
      });

      const nextLabels = [];
      const startCount = globalScannedInbound + 1;
      for (let i = 0; i < wo.quantity; i++) {
        const countStr = String(startCount + i).padStart(6, '0');
        nextLabels.push(`${wo.asset.code}_${countStr}`);
      }

      return res.status(200).json({
        success: true,
        data: {
          assetCode: wo.asset.code,
          assetName: wo.asset.name,
          quantity: wo.quantity,
          labels: nextLabels
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil saran label berdasarkan FIFO (Outbound)
   */
  static async getFifoSuggestions(req, res, next) {
    try {
      const { id } = req.params;
      const wo = await WorkOrder.findByPk(id, {
        include: [{ model: Asset, as: 'asset' }]
      });

      if (!wo) {
        return res.status(404).json({ success: false, message: 'Work Order tidak ditemukan' });
      }

      // FIFO suggestion labels:
      // Ambil label yang sudah inbound untuk storage bin ini, dan belum di-outbound-kan.
      // Urutkan berdasarkan inbound scanned_at terlama ke terbaru.
      const inboundScans = await WorkOrderScan.findAll({
        where: {
          type: 'inbound',
          work_order_id: {
            [Op.in]: sequelize.literal(`(SELECT id FROM work_orders WHERE storage_bin_id = '${wo.storageBinId}' AND asset_id = '${wo.assetId}')`)
          }
        },
        order: [['scannedAt', 'ASC']]
      });

      // Dapatkan list label yang sudah pernah outbound secara global
      const outboundScans = await WorkOrderScan.findAll({
        where: { type: 'outbound' },
        attributes: ['labelCode']
      });
      const outboundLabelCodes = new Set(outboundScans.map(s => s.labelCode));

      // Filter label yang tersedia untuk outbound
      const availableLabels = inboundScans
        .filter(scan => !outboundLabelCodes.has(scan.labelCode))
        .map(scan => ({
          labelCode: scan.labelCode,
          inboundScan: scan.scannedAt,
          assetName: wo.asset.name,
          binCode: wo.storageBinId
        }));

      // Saran label dibatasi sejumlah Qty WO
      const suggestions = availableLabels.slice(0, wo.quantity);

      return res.status(200).json({
        success: true,
        data: {
          suggestions,
          totalAvailable: availableLabels.length,
          quantityRequired: wo.quantity
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Melakukan scan barcode label untuk memproses Work Order
   */
  static async processScan(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { labelCode } = req.body;
      const userId = req.user.id;

      if (!labelCode || labelCode.trim() === '') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Kode label wajib diisi' });
      }

      // Ambil WO
      const wo = await WorkOrder.findByPk(id, {
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin' }
        ],
        transaction: t
      });

      if (!wo) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Work Order tidak ditemukan' });
      }

      if (wo.status === 'Done') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Work Order ini sudah selesai' });
      }

      // Hitung jumlah scan saat ini di WO ini
      const scannedCount = await WorkOrderScan.count({
        where: { workOrderId: id },
        transaction: t
      });

      if (scannedCount >= wo.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Kuantitas scan sudah terpenuhi untuk Work Order ini' });
      }

      // Validasi kecocokan asset code pada label
      if (!labelCode.startsWith(`${wo.asset.code}_`)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Kode label tidak cocok. Label harus diawali dengan SKU aset "${wo.asset.code}"`
        });
      }

      // Ambil data stok saat ini
      let stock = await Stock.findOne({
        where: { storageBinId: wo.storageBinId, assetId: wo.assetId },
        transaction: t
      });

      let updatedStockQty = stock ? stock.quantity : 0;

      if (wo.type === 'inbound') {
        // --- PROSES INBOUND SCAN ---

        // Cek duplicate scan secara global
        const existingInbound = await WorkOrderScan.findOne({
          where: { labelCode, type: 'inbound' },
          transaction: t
        });

        if (existingInbound) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Label "${labelCode}" sudah pernah di-scan masuk sebelumnya.`
          });
        }

        // Update Stok
        if (stock) {
          stock.quantity = Number(stock.quantity) + 1;
          await stock.save({ transaction: t });
          updatedStockQty = stock.quantity;
        } else {
          stock = await Stock.create({
            assetId: wo.assetId,
            storageBinId: wo.storageBinId,
            supplierId: wo.asset.supplierId || null,
            quantity: 1,
            price: wo.asset.price
          }, { transaction: t });
          updatedStockQty = 1;
        }

        // Set Storage Bin status to filled
        await wo.storageBin.update({ status: 'filled' }, { transaction: t });

      } else {
        // --- PROSES OUTBOUND SCAN ---

        // Ambil list inbound yang valid
        const inboundScans = await WorkOrderScan.findAll({
          where: {
            type: 'inbound',
            labelCode: { [Op.like]: `${wo.asset.code}_%` }
          },
          order: [['scannedAt', 'ASC']],
          transaction: t
        });

        // Dapatkan list outbound yang sudah terjadi
        const outboundScans = await WorkOrderScan.findAll({
          where: { type: 'outbound' },
          attributes: ['labelCode'],
          transaction: t
        });
        const outboundLabelCodes = new Set(outboundScans.map(s => s.labelCode));

        // Filter label yang tersedia untuk dioutboundkan
        const availableLabels = inboundScans.filter(scan => !outboundLabelCodes.has(scan.labelCode));

        if (availableLabels.length === 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'Tidak ada stok fisik berlabel yang tersedia di gudang.' });
        }

        // ENFORCE FIFO ORDER:
        // Barcode yang discan HARUS merupakan label paling tua yang belum di-outbound-kan.
        const oldestLabel = availableLabels[0];
        if (oldestLabel.labelCode !== labelCode) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Pelanggaran aturan FIFO. Anda harus memindai label terlama terlebih dahulu. Silakan scan label "${oldestLabel.labelCode}"`
          });
        }

        // Cek duplicate scan untuk outbound
        const existingOutbound = await WorkOrderScan.findOne({
          where: { labelCode, type: 'outbound' },
          transaction: t
        });

        if (existingOutbound) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Label "${labelCode}" sudah pernah di-scan keluar.`
          });
        }

        // Update Stok
        if (!stock || stock.quantity <= 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'Kesalahan integritas data: Stok di bin bernilai 0.' });
        }

        stock.quantity = Number(stock.quantity) - 1;
        await stock.save({ transaction: t });
        updatedStockQty = stock.quantity;

        // Jika stok habis, kosongkan bin dan hapus record stok aktif
        if (stock.quantity === 0) {
          await wo.storageBin.update({ status: 'empty' }, { transaction: t });
          await stock.destroy({ transaction: t });
        }
      }

      // Catat log scan ke database
      const newScan = await WorkOrderScan.create({
        workOrderId: id,
        labelCode,
        userId,
        type: wo.type,
        scannedAt: new Date(),
        updatedStock: updatedStockQty
      }, { transaction: t });

      // Update status Work Order
      const newScannedCount = scannedCount + 1;
      let newStatus = 'On Progress';
      if (newScannedCount === wo.quantity) {
        newStatus = 'Done';
      }

      await wo.update({ status: newStatus }, { transaction: t });

      // Catat ke log transaksi legacy untuk menjaga kompatibilitas data riwayat
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const refPrefix = wo.type === 'inbound' ? 'INB' : 'OUT';
      const refCount = await db.TransactionLog.count({
        where: {
          type: wo.type,
          createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
        },
        transaction: t
      });
      const refNumber = `${refPrefix}-${dateStr}-${String(refCount + 1).padStart(3, '0')}`;

      await db.TransactionLog.create({
        type: wo.type,
        assetId: wo.assetId,
        storageBinId: wo.storageBinId,
        supplierId: wo.type === 'inbound' ? (wo.asset.supplierId || null) : null,
        quantity: 1,
        price: wo.asset.price,
        userId: userId,
        referenceNumber: refNumber
      }, { transaction: t });

      await t.commit();

      return res.status(200).json({
        success: true,
        message: `Label "${labelCode}" berhasil di-scan.`,
        data: {
          scan: newScan,
          currentScannedCount: newScannedCount,
          status: newStatus
        }
      });

    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

export default WorkOrderController;
