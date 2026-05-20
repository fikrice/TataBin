import db from '../models/index.js';

const { Stock, StorageBin, Asset, Supplier, TransactionLog, sequelize } = db;

/**
 * Controller Operasional Inbound
 * Menangani proses penerimaan barang masuk ke gudang:
 * - Validasi kecocokan kategori aset dan bin
 * - Membuat/memperbarui record stok
 * - Mengubah status bin menjadi 'filled'
 * - Mencatat log transaksi inbound
 */
class InboundController {

  /**
   * Memproses operasi barang masuk (inbound) ke dalam slot penyimpanan
   * @param {object} req - Request body: { assetId, storageBinId, supplierId, quantity, price }
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async processInbound(req, res, next) {
    // Gunakan transaksi database agar semua perubahan bersifat atomik (semua berhasil atau semua dibatalkan)
    const t = await sequelize.transaction();

    try {
      const { assetId, storageBinId, supplierId, quantity, price } = req.body;
      const errors = {};

      // Validasi input wajib
      if (!assetId) errors.assetId = ['Aset wajib dipilih'];
      if (!storageBinId) errors.storageBinId = ['Slot penyimpanan wajib dipilih'];
      if (!supplierId) errors.supplierId = ['Pemasok wajib dipilih'];
      if (!quantity || quantity <= 0) errors.quantity = ['Jumlah barang harus lebih dari 0'];
      if (price === undefined || price === null || Number(price) < 0) errors.price = ['Harga tidak boleh negatif'];

      if (Object.keys(errors).length > 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      // Ambil data aset dan bin dari database
      const asset = await Asset.findByPk(assetId, { transaction: t });
      const bin = await StorageBin.findByPk(storageBinId, {
        include: [{ model: db.Warehouse, as: 'warehouse' }],
        transaction: t
      });
      const supplier = await Supplier.findByPk(supplierId, { transaction: t });

      if (!asset) { await t.rollback(); return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' }); }
      if (!bin) { await t.rollback(); return res.status(404).json({ success: false, message: 'Slot penyimpanan tidak ditemukan' }); }
      if (!supplier) { await t.rollback(); return res.status(404).json({ success: false, message: 'Pemasok tidak ditemukan' }); }

      // Aturan bisnis: Kategori aset HARUS cocok dengan kategori bin
      if (asset.category !== bin.category) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Kategori tidak cocok. Aset "${asset.name}" berkategori "${asset.category}" tidak bisa dialokasikan ke bin "${bin.code}" berkategori "${bin.category}".`
        });
      }

      // Cek apakah bin sudah memiliki stok dari aset LAIN
      const existingStock = await Stock.findOne({ where: { storageBinId }, transaction: t });
      if (existingStock && existingStock.assetId !== assetId) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Bin "${bin.code}" sudah dialokasikan untuk aset lain. Setiap bin hanya boleh menyimpan 1 jenis aset.`
        });
      }

      // Validate supplierId - use null if not provided (stock can exist without supplier)
      const finalSupplierId = supplierId || null;

      // Buat atau update record stok
      let stock;
      if (existingStock) {
        existingStock.quantity = Number(existingStock.quantity) + Number(quantity);
        existingStock.price = Number(price);
        await existingStock.save({ transaction: t });
        stock = existingStock;
      } else {
        stock = await Stock.create({
          assetId,
          storageBinId,
          supplierId: finalSupplierId,
          quantity: Number(quantity),
          price: Number(price)
        }, { transaction: t });
      }

      // Ubah status bin menjadi 'filled'
      await bin.update({ status: 'filled' }, { transaction: t });

      // Generate nomor referensi otomatis: INB-YYYYMMDD-NNN
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await TransactionLog.count({
        where: {
          type: 'inbound',
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(today.getFullYear(), today.getMonth(), today.getDate())
          }
        },
        transaction: t
      });
      const refNumber = `INB-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      // Catat log transaksi inbound
      const log = await TransactionLog.create({
        type: 'inbound',
        assetId,
        storageBinId,
        supplierId,
        quantity: Number(quantity),
        price: Number(price),
        userId: req.user.id,
        referenceNumber: refNumber
      }, { transaction: t });

      // Commit semua perubahan ke database
      await t.commit();

      // Muat ulang log beserta relasi untuk respon lengkap
      const fullLog = await TransactionLog.findByPk(log.id, {
        include: [
          { model: Asset, as: 'asset' },
          { model: StorageBin, as: 'storageBin', include: [{ model: db.Warehouse, as: 'warehouse' }] },
          { model: Supplier, as: 'supplier' },
          { model: db.User, as: 'user', attributes: ['id', 'username', 'fullName'] }
        ]
      });

      return res.status(201).json({
        success: true,
        message: `Barang masuk berhasil dicatat. Referensi: ${refNumber}`,
        data: {
          transaction: fullLog,
          stock
        }
      });

    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

export default InboundController;
