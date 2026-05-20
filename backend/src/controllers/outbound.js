import db from '../models/index.js';

const { Stock, StorageBin, Asset, Supplier, TransactionLog, sequelize } = db;

/**
 * Controller Operasional Outbound (FIFO)
 * Menangani proses pengeluaran barang dari gudang menggunakan prinsip First-In First-Out:
 * - Mendebit stok dari record yang paling LAMA terlebih dahulu
 * - Menghapus record stok yang kuantitasnya habis (0)
 * - Mengubah status bin kembali ke 'empty' jika stok habis
 * - Mencatat log transaksi outbound
 */
class OutboundController {

  /**
   * Memproses operasi barang keluar (outbound) dengan metode FIFO
   * @param {object} req - Request body: { assetId, quantity }
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async processOutbound(req, res, next) {
    const t = await sequelize.transaction();

    try {
      const { assetId, quantity } = req.body;
      const errors = {};

      if (!assetId) errors.assetId = ['Aset wajib dipilih'];
      if (!quantity || quantity <= 0) errors.quantity = ['Jumlah barang harus lebih dari 0'];

      if (Object.keys(errors).length > 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      const asset = await Asset.findByPk(assetId, { transaction: t });
      if (!asset) { await t.rollback(); return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' }); }

      // Ambil semua record stok untuk aset ini, urutkan dari yang paling LAMA masuk (FIFO)
      const stocks = await Stock.findAll({
        where: { assetId },
        order: [['createdAt', 'ASC']],
        include: [
          { model: StorageBin, as: 'storageBin', include: [{ model: db.Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' }
        ],
        transaction: t
      });

      // Hitung total stok tersedia
      const totalAvailable = stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
      if (totalAvailable < Number(quantity)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok tidak mencukupi. Tersedia ${totalAvailable} unit, diminta ${quantity} unit untuk "${asset.name}".`
        });
      }

      // Proses FIFO: kurangi stok dari record terlama
      let remaining = Number(quantity);
      const affectedBins = []; // Daftar bin yang terdampak untuk pencatatan log

      for (const stock of stocks) {
        if (remaining <= 0) break;

        const stockQty = Number(stock.quantity);
        const debit = Math.min(stockQty, remaining);

        // Catat bin yang terdampak beserta jumlah debitnya
        affectedBins.push({
          stockId: stock.id,
          storageBinId: stock.storageBinId,
          binCode: stock.storageBin?.code,
          warehouseName: stock.storageBin?.warehouse?.name,
          supplierId: stock.supplierId,
          debitQty: debit,
          price: Number(stock.price)
        });

        if (debit >= stockQty) {
          // Stok record ini habis - hapus record dan ubah status bin menjadi 'empty'
          await stock.destroy({ transaction: t });
          await StorageBin.update({ status: 'empty' }, { where: { id: stock.storageBinId }, transaction: t });
        } else {
          // Kurangi kuantitas saja
          stock.quantity = stockQty - debit;
          await stock.save({ transaction: t });
        }

        remaining -= debit;
      }

      // Generate nomor referensi outbound: OUT-YYYYMMDD-NNN
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await TransactionLog.count({
        where: {
          type: 'outbound',
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        },
        transaction: t
      });
      const refNumber = `OUT-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      // Catat log transaksi outbound untuk setiap bin yang terdampak
      const logs = [];
      for (const affected of affectedBins) {
        const log = await TransactionLog.create({
          type: 'outbound',
          assetId,
          storageBinId: affected.storageBinId,
          supplierId: affected.supplierId,
          quantity: affected.debitQty,
          price: affected.price,
          userId: req.user.id,
          referenceNumber: refNumber
        }, { transaction: t });
        logs.push(log);
      }

      await t.commit();

      return res.status(201).json({
        success: true,
        message: `Barang keluar berhasil dicatat. Referensi: ${refNumber}. Total ${quantity} unit "${asset.name}" telah dikeluarkan dari ${affectedBins.length} bin.`,
        data: {
          referenceNumber: refNumber,
          asset: { id: asset.id, code: asset.code, name: asset.name },
          totalQuantity: Number(quantity),
          affectedBins,
          logs
        }
      });

    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  /**
   * Memverifikasi label berdasarkan nomor referensi (simulasi scan barcode/QR)
   * @param {object} req - Request params: { ref }
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async verifyLabel(req, res, next) {
    try {
      const { ref } = req.params;

      const logs = await TransactionLog.findAll({
        where: { referenceNumber: ref },
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin', include: [{ model: db.Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' },
          { model: db.User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ],
        order: [['createdAt', 'ASC']]
      });

      if (logs.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Label dengan referensi "${ref}" tidak ditemukan.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Label berhasil diverifikasi',
        data: logs
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil daftar stok per aset untuk keperluan form outbound
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getStockSummary(req, res, next) {
    try {
      // Ambil semua stok yang ada, grup berdasarkan aset
      const stocks = await Stock.findAll({
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin', include: [{ model: db.Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' }
        ],
        order: [['createdAt', 'ASC']]
      });

      // Kelompokkan berdasarkan aset
      const summary = {};
      for (const s of stocks) {
        const aId = s.assetId;
        if (!summary[aId]) {
          summary[aId] = {
            asset: s.asset,
            totalQuantity: 0,
            bins: []
          };
        }
        summary[aId].totalQuantity += Number(s.quantity);
        summary[aId].bins.push({
          stockId: s.id,
          binCode: s.storageBin?.code,
          warehouseName: s.storageBin?.warehouse?.name,
          quantity: Number(s.quantity),
          price: Number(s.price),
          createdAt: s.createdAt
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ringkasan stok berhasil dimuat',
        data: Object.values(summary)
      });

    } catch (error) {
      next(error);
    }
  }
}

export default OutboundController;
