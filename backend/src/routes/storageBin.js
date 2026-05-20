import { Router } from 'express';
import StorageBinController from '../controllers/storageBin.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute Slot Penyimpanan (Storage Bin)
const storageBinRouter = Router();

/**
 * Rute Membaca Daftar & Detail Slot Penyimpanan
 * Dapat diakses oleh Admin dan Crew setelah login (terotentikasi)
 */
storageBinRouter.get('/', AuthMiddleware.authenticate, StorageBinController.getAll);
storageBinRouter.get('/:id', AuthMiddleware.authenticate, StorageBinController.getById);

/**
 * Rute Modifikasi Slot Penyimpanan (Tambah, Edit, Hapus)
 * Hanya boleh diakses oleh pengguna dengan role 'admin'
 */
storageBinRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, StorageBinController.create);
storageBinRouter.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, StorageBinController.update);
storageBinRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, StorageBinController.delete);

export default storageBinRouter;
