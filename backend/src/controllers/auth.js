import db from '../models/index.js';
import Helpers from '../utils/helpers.js';

const { User } = db;

/**
 * Controller Autentikasi (AuthController)
 * Menangani fungsi registrasi pengguna baru, login pengguna, dan mendapatkan profil pengguna saat ini.
 */
class AuthController {
  
  /**
   * Mendaftar pengguna (user) baru ke dalam sistem
   * @param {object} req - Request object dari Express
   * @param {object} res - Response object dari Express
   * @param {function} next - Middleware error handler
   */
  static async register(req, res, next) {
    try {
      const { username, email, password, fullName, role } = req.body;

      // Validasi input awal
      const errors = {};
      if (!username || username.trim().length < 3) {
        errors.username = ['Username minimal harus 3 karakter'];
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ['Format email tidak valid'];
      }
      if (!password || password.length < 6) {
        errors.password = ['Password minimal harus 6 karakter'];
      } else {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?`~\s]).+$/;
        if (!passwordRegex.test(password)) {
          errors.password = ['Password harus mengandung minimal 1 huruf besar, 1 angka, dan 1 karakter spesial'];
        }
      }

      // Jika ada error validasi input, kembalikan respon 400
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validasi input gagal',
          errors
        });
      }

      // Cek apakah username atau email sudah terdaftar sebelumnya
      const existingUser = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        if (existingUser.username === username) {
          errors.username = ['Username sudah terdaftar'];
        }
        if (existingUser.email === email) {
          errors.email = ['Email sudah terdaftar'];
        }
        return res.status(400).json({
          success: false,
          message: 'Data pengguna sudah terdaftar',
          errors
        });
      }

      const count = await User.count();
      const code = `USER_${String(count + 1).padStart(2, '0')}`;

      // Membuat record pengguna baru di database
      const newUser = await User.create({
        code,
        username,
        email,
        password,
        fullName,
        telephoneNumber: req.body.telephoneNumber,
        role: role || 'crew'
      });

      // Kembalikan respon sukses pendaftaran
      return res.status(201).json({
        success: true,
        message: 'Registrasi pengguna baru berhasil',
        data: newUser
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Melakukan verifikasi login pengguna dan menerbitkan token JWT
   * @param {object} req - Request object dari Express
   * @param {object} res - Response object dari Express
   * @param {function} next - Middleware error handler
   */
  static async login(req, res, next) {
    try {
      const { usernameOrEmail, password } = req.body;

      // Validasi input login
      if (!usernameOrEmail || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username/Email dan password wajib diisi'
        });
      }

      // Cari user berdasarkan username ATAU email
      const user = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
          ]
        }
      });

      // Jika user tidak ditemukan
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username, Email, atau Password salah'
        });
      }

      // Verifikasi kecocokan password menggunakan instance method comparePassword
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Username, Email, atau Password salah'
        });
      }

      // Terbitkan JWT token yang berisi data identitas user
      const token = Helpers.generateToken(user);

      // Kembalikan respon sukses login beserta token
      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil detail profil pengguna yang sedang login berdasarkan token JWT
   * @param {object} req - Request object dari Express (memiliki field req.user dari auth middleware)
   * @param {object} res - Response object dari Express
   * @param {function} next - Middleware error handler
   */
  static async me(req, res, next) {
    try {
      // Mengembalikan data user yang dimuat oleh middleware authenticate
      return res.status(200).json({
        success: true,
        message: 'Profil pengguna berhasil dimuat',
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
