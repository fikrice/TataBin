import db from '../models/index.js';
import Helpers from '../utils/helpers.js';

const { User } = db;

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = Helpers.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid atau sudah kadaluarsa'
        });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

  static async authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya untuk admin'
      });
    }
    next();
  }
}

export default AuthMiddleware;
