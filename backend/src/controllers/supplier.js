import db from '../models/index.js';

const { Supplier } = db;

/**
 * Controller Pemasok (SupplierController)
 * Mengelola operasi CRUD untuk entitas Pemasok (Supplier).
 */
class SupplierController {

  /**
   * Mengambil semua daftar pemasok
   */
  static async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await Supplier.findAndCountAll({
        limit,
        offset,
        order: [['code', 'ASC']]
      });
      return res.status(200).json({
        success: true,
        message: 'Daftar pemasok berhasil dimuat',
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) { next(error); }
  }

  /**
   * Mengambil detail pemasok berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Pemasok tidak ditemukan' });
      }
      return res.status(200).json({ success: true, message: 'Detail pemasok berhasil dimuat', data: supplier });
    } catch (error) { next(error); }
  }

  /**
   * Membuat data pemasok baru
   */
  static async create(req, res, next) {
    try {
      const { name, contact, category, address } = req.body;
      const errors = {};

      if (!name || name.trim() === '') errors.name = ['Nama pemasok wajib diisi'];
      if (!category || !['Local', 'Import'].includes(category)) {
        errors.category = ['Kategori pemasok harus bernilai Local atau Import'];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      const count = await Supplier.count();
      const code = `SUP_${String(count + 1).padStart(2, '0')}`;

      const newSupplier = await Supplier.create({ code, name, contact, category, address });
      return res.status(201).json({ success: true, message: 'Pemasok baru berhasil ditambahkan', data: newSupplier });
    } catch (error) { next(error); }
  }

  /**
   * Memperbarui data pemasok berdasarkan ID
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, contact, category, address } = req.body;
      const errors = {};

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Pemasok tidak ditemukan' });
      }

      if (!name || name.trim() === '') errors.name = ['Nama pemasok wajib diisi'];
      if (!category || !['Local', 'Import'].includes(category)) {
        errors.category = ['Kategori pemasok harus bernilai Local atau Import'];
      }
      
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      await supplier.update({ name, contact, category, address });
      return res.status(200).json({ success: true, message: 'Data pemasok berhasil diperbarui', data: supplier });
    } catch (error) { next(error); }
  }

  /**
   * Menghapus pemasok berdasarkan ID
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Pemasok tidak ditemukan' });
      }

      await supplier.destroy();
      return res.status(200).json({ success: true, message: 'Pemasok berhasil dihapus' });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Pemasok tidak bisa dihapus karena memiliki data stok atau log transaksi yang terhubung.'
        });
      }
      next(error);
    }
  }
}

export default SupplierController;
