import db from '../models/index.js';

const { StorageBin, Warehouse } = db;

/**
 * Controller Slot Penyimpanan (StorageBinController)
 * Mengelola operasi CRUD untuk entitas Slot Penyimpanan (Storage Bin).
 */
class StorageBinController {

  /**
   * Mengambil semua daftar slot penyimpanan beserta data gudangnya
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await StorageBin.findAndCountAll({
        include: [
          {
            model: Warehouse,
            as: 'warehouse',
            attributes: ['id', 'name', 'code']
          },
          {
            model: db.Asset,
            as: 'allocatedAsset',
            attributes: ['id', 'code', 'name', 'category']
          }
        ],
        limit,
        offset,
        order: [['code', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Daftar slot penyimpanan berhasil dimuat',
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
   * Mengambil detail slot penyimpanan berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const storageBin = await StorageBin.findByPk(id, {
        include: [
          {
            model: Warehouse,
            as: 'warehouse',
            attributes: ['id', 'name', 'code']
          },
          {
            model: db.Asset,
            as: 'allocatedAsset',
            attributes: ['id', 'code', 'name', 'category']
          }
        ]
      });

      if (!storageBin) {
        return res.status(404).json({
          success: false,
          message: 'Slot penyimpanan tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Detail slot penyimpanan berhasil dimuat',
        data: storageBin
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Membuat data slot penyimpanan baru
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async create(req, res, next) {
    try {
      const { warehouseId, assetId, category, status, remarks } = req.body;
      const errors = {};

      // Validasi input wajib
      if (!warehouseId) {
        errors.warehouseId = ['Gudang wajib dipilih'];
      }
      if (!assetId) {
        errors.assetId = ['Alokasi aset wajib dipilih'];
      }
      if (!category || !['Small Asset', 'Medium Asset', 'Large Asset'].includes(category)) {
        errors.category = ['Kategori ukuran harus bernilai Small Asset, Medium Asset, atau Large Asset'];
      }

      // Pastikan gudang yang dipilih benar-benar ada
      let warehouse = null;
      if (warehouseId) {
        warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
          errors.warehouseId = ['Gudang yang dipilih tidak valid'];
        }
      }

      // Pastikan aset yang dipilih benar-benar ada dan kategori sesuai
      if (assetId && category) {
        const asset = await db.Asset.findByPk(assetId);
        if (!asset) {
          errors.assetId = ['Aset yang dialokasikan tidak valid'];
        } else if (asset.category !== category) {
          errors.assetId = ['Kategori aset tidak sesuai dengan kategori slot penyimpanan'];
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      // Auto-generate code: WarehouseNumber_Count3digits
      const binCount = await StorageBin.count({ where: { warehouseId } });
      const code = `${warehouse.code}_${String(binCount + 1).padStart(3, '0')}`;

      const newBin = await StorageBin.create({
        warehouseId,
        assetId,
        code,
        category,
        status: status || 'empty',
        remarks
      });

      // Muat ulang data baru beserta asosiasi gudangnya untuk dikembalikan ke frontend
      const binWithRelations = await StorageBin.findByPk(newBin.id, {
        include: [
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
          { model: db.Asset, as: 'allocatedAsset', attributes: ['id', 'code', 'name', 'category'] }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Slot penyimpanan baru berhasil ditambahkan',
        data: binWithRelations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Memperbarui data slot penyimpanan berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { warehouseId, assetId, category, status, remarks } = req.body;
      const errors = {};

      const storageBin = await StorageBin.findByPk(id);
      if (!storageBin) {
        return res.status(404).json({
          success: false,
          message: 'Slot penyimpanan tidak ditemukan'
        });
      }

      // Validasi input wajib
      if (!warehouseId) {
        errors.warehouseId = ['Gudang wajib dipilih'];
      }
      if (!assetId) {
        errors.assetId = ['Alokasi aset wajib dipilih'];
      }
      if (!category || !['Small Asset', 'Medium Asset', 'Large Asset'].includes(category)) {
        errors.category = ['Kategori ukuran harus bernilai Small Asset, Medium Asset, atau Large Asset'];
      }

      // Pastikan gudang yang dipilih benar-benar ada
      let warehouse = null;
      if (warehouseId) {
        warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
          errors.warehouseId = ['Gudang yang dipilih tidak valid'];
        }
      }

      // Pastikan aset yang dipilih benar-benar ada dan kategori sesuai
      if (assetId && category) {
        const asset = await db.Asset.findByPk(assetId);
        if (!asset) {
          errors.assetId = ['Aset yang dialokasikan tidak valid'];
        } else if (asset.category !== category) {
          errors.assetId = ['Kategori aset tidak sesuai dengan kategori slot penyimpanan'];
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      // Jika warehouseId berubah, generate kode baru
      let code = storageBin.code;
      if (warehouseId !== storageBin.warehouseId) {
        const binCount = await StorageBin.count({ where: { warehouseId } });
        code = `${warehouse.code}_${String(binCount + 1).padStart(3, '0')}`;
      }

      await storageBin.update({
        warehouseId,
        assetId,
        code,
        category,
        status: status || storageBin.status,
        remarks
      });

      // Muat ulang data terbaru beserta asosiasi gudangnya
      const updatedBin = await StorageBin.findByPk(id, {
        include: [
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
          { model: db.Asset, as: 'allocatedAsset', attributes: ['id', 'code', 'name', 'category'] }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Data slot penyimpanan berhasil diperbarui',
        data: updatedBin
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus slot penyimpanan berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const storageBin = await StorageBin.findByPk(id);

      if (!storageBin) {
        return res.status(404).json({
          success: false,
          message: 'Slot penyimpanan tidak ditemukan'
        });
      }

      await storageBin.destroy();

      return res.status(200).json({
        success: true,
        message: 'Slot penyimpanan berhasil dihapus'
      });
    } catch (error) {
      // Jika terjadi error foreign key restrict dari PostgreSQL
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Slot penyimpanan tidak bisa dihapus karena sedang digunakan dalam stok barang atau memiliki riwayat transaksi masuk/keluar.'
        });
      }
      next(error);
    }
  }
}

export default StorageBinController;
