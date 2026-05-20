import { Router } from 'express';
import AuthController from '../controllers/auth.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute autentikasi
const authRouter = Router();

/**
 * Endpoint Registrasi Pengguna Baru
 * Rute ini dapat diakses secara umum
 */
authRouter.post('/register', AuthController.register);

/**
 * Endpoint Login Pengguna
 * Rute ini memverifikasi kredensial dan mengembalikan JWT token
 */
authRouter.post('/login', AuthController.login);

/**
 * Endpoint Pengambilan Data Pengguna Aktif
 * Rute ini membutuhkan header 'Authorization: Bearer <token>' yang valid
 */
authRouter.get('/me', AuthMiddleware.authenticate, AuthController.me);

export default authRouter;
