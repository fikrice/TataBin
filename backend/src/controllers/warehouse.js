import db from '../models/index.js';

const { Warehouse, StorageBin } = db;

/**
 * Controller Gudang (WarehouseController)
 * Mengelola operasi CRUD untuk entitas Gudang (Warehouse).
 */
class WarehouseController {
  
  /**
   * Mengambil semua daftar gudang
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await Warehouse.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Daftar gudang berhasil dimuat',
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
   * Mengambil detail gudang berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findByPk(id, {
        include: [{ model: StorageBin, as: 'storageBins' }]
      });

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Gudang tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Detail gudang berhasil dimuat',
        data: warehouse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Membuat data gudang baru
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async create(req, res, next) {
    try {
      const { name, location, capacity, description } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama gudang wajib diisi',
          errors: { name: ['Nama gudang tidak boleh kosong'] }
        });
      }

      const count = await Warehouse.count();
      const code = `WH_${String(count + 1).padStart(2, '0')}`;

      const newWarehouse = await Warehouse.create({
        code,
        name,
        location,
        capacity: capacity || 0,
        description
      });

      return res.status(201).json({
        success: true,
        message: 'Gudang baru berhasil ditambahkan',
        data: newWarehouse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Memperbarui data gudang berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, location, capacity, description } = req.body;

      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Gudang tidak ditemukan'
        });
      }

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama gudang wajib diisi',
          errors: { name: ['Nama gudang tidak boleh kosong'] }
        });
      }

      await warehouse.update({
        name,
        location,
        capacity: capacity !== undefined ? capacity : warehouse.capacity,
        description
      });

      return res.status(200).json({
        success: true,
        message: 'Data gudang berhasil diperbarui',
        data: warehouse
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus gudang berdasarkan ID
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Error handler
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const warehouse = await Warehouse.findByPk(id);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Gudang tidak ditemukan'
        });
      }

      // Hapus gudang (relasi CASCADE pada storage_bins akan dipicu di database. 
      // Jika bin sedang digunakan oleh stock/logs, database RESTRICT constraint akan melempar error).
      await warehouse.destroy();

      return res.status(200).json({
        success: true,
        message: 'Gudang berhasil dihapus'
      });
    } catch (error) {
      // Jika terjadi error foreign key restrict dari PostgreSQL
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Gudang tidak bisa dihapus karena slot penyimpanan di dalamnya sedang menyimpan barang/memiliki riwayat transaksi.'
        });
      }
      next(error);
    }
  }
}

export default WarehouseController;
