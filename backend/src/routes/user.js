import { Router } from 'express';
import UserController from '../controllers/user.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute Pengguna/Karyawan
const userRouter = Router();

/**
 * Seluruh rute pengelolaan User hanya boleh diakses oleh 'admin'
 */
userRouter.get('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, UserController.getAll);
userRouter.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, UserController.getById);
userRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, UserController.create);
userRouter.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, UserController.update);
userRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, UserController.delete);

export default userRouter;
