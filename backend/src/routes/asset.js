import { Router } from 'express';
import AssetController from '../controllers/asset.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute Aset
const assetRouter = Router();

/**
 * Rute Membaca Daftar & Detail Aset
 * Dapat diakses oleh Admin dan Crew yang sudah login
 */
assetRouter.get('/', AuthMiddleware.authenticate, AssetController.getAll);
assetRouter.get('/:id', AuthMiddleware.authenticate, AssetController.getById);

/**
 * Rute Modifikasi Aset (Tambah, Edit, Hapus)
 * Hanya boleh diakses oleh pengguna dengan role 'admin'
 */
assetRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, AssetController.create);
assetRouter.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, AssetController.update);
assetRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, AssetController.delete);

export default assetRouter;
