import db from '../models/index.js';

const { Asset } = db;

/**
 * Controller Aset (AssetController)
 * Mengelola operasi CRUD untuk entitas Aset (Asset).
 */
class AssetController {

  /**
   * Mengambil semua daftar aset
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await Asset.findAndCountAll({
        include: [{
          model: db.Supplier,
          as: 'supplier',
          attributes: ['id', 'code', 'name']
        }],
        limit,
        offset,
        order: [['code', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Daftar aset berhasil dimuat',
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
   * Mengambil detail aset berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await Asset.findByPk(id, {
        include: [{
          model: db.Supplier,
          as: 'supplier',
          attributes: ['id', 'code', 'name']
        }]
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Detail aset berhasil dimuat',
        data: asset
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Membuat data aset baru
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async create(req, res, next) {
    try {
      const { name, category, price, description, supplierId } = req.body;
      const errors = {};

      // Validasi input wajib
      if (!name || name.trim() === '') {
        errors.name = ['Nama aset wajib diisi'];
      }
      if (!category || !['Small Asset', 'Medium Asset', 'Large Asset'].includes(category)) {
        errors.category = ['Kategori ukuran harus bernilai Small Asset, Medium Asset, atau Large Asset'];
      }
      if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
        errors.price = ['Harga aset wajib diisi dan tidak boleh bernilai negatif'];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      const count = await Asset.count();
      const code = `AST_${String(count + 1).padStart(2, '0')}`;

      const newAsset = await Asset.create({
        code,
        name,
        category,
        price: Number(price),
        description,
        supplierId: supplierId || null
      });

      const assetWithSupplier = await Asset.findByPk(newAsset.id, {
        include: [{
          model: db.Supplier,
          as: 'supplier',
          attributes: ['id', 'code', 'name']
        }]
      });

      return res.status(201).json({
        success: true,
        message: 'Aset baru berhasil ditambahkan',
        data: assetWithSupplier
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Memperbarui data aset berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, category, price, description, supplierId } = req.body;
      const errors = {};

      const asset = await Asset.findByPk(id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan'
        });
      }

      // Validasi input wajib
      if (!name || name.trim() === '') {
        errors.name = ['Nama aset wajib diisi'];
      }
      if (!category || !['Small Asset', 'Medium Asset', 'Large Asset'].includes(category)) {
        errors.category = ['Kategori ukuran harus bernilai Small Asset, Medium Asset, atau Large Asset'];
      }
      if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
        errors.price = ['Harga aset wajib diisi dan tidak boleh bernilai negatif'];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      await asset.update({
        name,
        category,
        price: Number(price),
        description,
        supplierId: supplierId || null
      });

      const updatedAsset = await Asset.findByPk(id, {
        include: [{
          model: db.Supplier,
          as: 'supplier',
          attributes: ['id', 'code', 'name']
        }]
      });

      return res.status(200).json({
        success: true,
        message: 'Data aset berhasil diperbarui',
        data: updatedAsset
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus aset berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await Asset.findByPk(id);

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan'
        });
      }

      await asset.destroy();

      return res.status(200).json({
        success: true,
        message: 'Aset berhasil dihapus'
      });
    } catch (error) {
      // Jika terjadi error foreign key restrict dari PostgreSQL
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Aset tidak bisa dihapus karena sedang terdaftar dalam stok gudang atau memiliki catatan log transaksi.'
        });
      }
      next(error);
    }
  }
}

export default AssetController;
