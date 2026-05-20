import db from '../models/index.js';
import bcrypt from 'bcryptjs';

const { User } = db;

// Password default untuk crew baru yang dibuat oleh admin
const DEFAULT_CREW_PASSWORD = 'Qwerty123*';

/**
 * Controller Pengguna/Karyawan (UserController)
 * Mengelola operasi CRUD untuk entitas User (Karyawan).
 * Seluruh endpoint hanya dapat diakses oleh pengguna dengan role 'admin'.
 */
class UserController {

  /**
   * Mengambil semua daftar pengguna (kecuali password)
   */
  static async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        message: 'Daftar pengguna berhasil dimuat',
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
   * Mengambil detail pengguna berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }
      return res.status(200).json({ success: true, message: 'Detail pengguna berhasil dimuat', data: user });
    } catch (error) { next(error); }
  }

  /**
   * Membuat pengguna/karyawan baru.
   * Jika password tidak diisi, gunakan password default crew: Qwerty123*
   */
  static async create(req, res, next) {
    try {
      const { username, email, password, fullName, telephoneNumber, role } = req.body;
      const errors = {};

      if (!username || username.trim().length < 3) errors.username = ['Username minimal 3 karakter'];
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Format email tidak valid'];
      if (!fullName || fullName.trim() === '') errors.fullName = ['Nama lengkap wajib diisi'];
      
      const finalPassword = password && password.trim() !== '' ? password : DEFAULT_CREW_PASSWORD;
      
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?`~\s]).+$/;
      if (!passwordRegex.test(finalPassword)) {
        errors.password = ['Password harus mengandung minimal 1 huruf besar, 1 angka, dan 1 karakter spesial'];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      // Cek apakah username atau email sudah terdaftar
      const existing = await User.findOne({
        where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
      });
      if (existing) {
        if (existing.username === username) errors.username = ['Username sudah terdaftar'];
        if (existing.email === email) errors.email = ['Email sudah terdaftar'];
        return res.status(400).json({ success: false, message: 'Data pengguna sudah terdaftar', errors });
      }

      const count = await User.count();
      const code = `USER_${String(count + 1).padStart(2, '0')}`;

      const newUser = await User.create({
        code,
        username,
        email,
        password: finalPassword,
        fullName,
        telephoneNumber,
        role: role || 'crew'
      });

      return res.status(201).json({
        success: true,
        message: `Pengguna baru berhasil ditambahkan. Password default: "${finalPassword}"`,
        data: newUser
      });
    } catch (error) { next(error); }
  }

  /**
   * Memperbarui data pengguna berdasarkan ID.
   * Jika field password diisi, password akan diubah. Jika kosong, password lama tetap digunakan.
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { username, email, password, fullName, telephoneNumber, role } = req.body;
      const errors = {};

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }

      if (!username || username.trim().length < 3) errors.username = ['Username minimal 3 karakter'];
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Format email tidak valid'];
      if (!fullName || fullName.trim() === '') errors.fullName = ['Nama lengkap wajib diisi'];
      
      if (password && password.trim() !== '') {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?`~\s]).+$/;
        if (!passwordRegex.test(password)) {
          errors.password = ['Password harus mengandung minimal 1 huruf besar, 1 angka, dan 1 karakter spesial'];
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validasi input gagal', errors });
      }

      // Cek keunikan username/email pada pengguna lain
      const existing = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }],
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existing) {
        if (existing.username === username) errors.username = ['Username sudah terdaftar'];
        if (existing.email === email) errors.email = ['Email sudah terdaftar'];
        return res.status(400).json({ success: false, message: 'Data pengguna sudah terdaftar', errors });
      }

      // Siapkan data yang akan diupdate
      const updateData = { username, email, fullName, telephoneNumber, role: role || user.role };

      // Jika password baru diisi, hash password baru sebelum disimpan
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      await user.update(updateData);

      // Muat ulang data terbaru (agar password baru tidak dikembalikan)
      const updatedUser = await User.findByPk(id);
      return res.status(200).json({
        success: true,
        message: 'Data pengguna berhasil diperbarui',
        data: updatedUser
      });
    } catch (error) { next(error); }
  }

  /**
   * Menghapus pengguna berdasarkan ID.
   * Admin tidak bisa menghapus akun dirinya sendiri.
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cegah admin menghapus akun dirinya sendiri
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Anda tidak dapat menghapus akun Anda sendiri.'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }

      await user.destroy();
      return res.status(200).json({ success: true, message: 'Pengguna berhasil dihapus' });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Pengguna tidak bisa dihapus karena memiliki riwayat transaksi yang terhubung.'
        });
      }
      next(error);
    }
  }
}

export default UserController;
