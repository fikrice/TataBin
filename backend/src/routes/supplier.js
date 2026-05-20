import { Router } from 'express';
import SupplierController from '../controllers/supplier.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute Pemasok
const supplierRouter = Router();

/**
 * Rute Membaca Daftar & Detail Pemasok
 * Dapat diakses oleh Admin dan Crew yang sudah login
 */
supplierRouter.get('/', AuthMiddleware.authenticate, SupplierController.getAll);
supplierRouter.get('/:id', AuthMiddleware.authenticate, SupplierController.getById);

/**
 * Rute Modifikasi Pemasok (Tambah, Edit, Hapus)
 * Hanya boleh diakses oleh pengguna dengan role 'admin'
 */
supplierRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, SupplierController.create);
supplierRouter.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, SupplierController.update);
supplierRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, SupplierController.delete);

export default supplierRouter;
