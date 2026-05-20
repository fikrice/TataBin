import { Router } from 'express';
import WarehouseController from '../controllers/warehouse.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router Express untuk rute Gudang
const warehouseRouter = Router();

/**
 * Rute Membaca Daftar & Detail Gudang
 * Dapat diakses oleh Admin dan Crew setelah login (terotentikasi)
 */
warehouseRouter.get('/', AuthMiddleware.authenticate, WarehouseController.getAll);
warehouseRouter.get('/:id', AuthMiddleware.authenticate, WarehouseController.getById);

/**
 * Rute Modifikasi Gudang (Tambah, Edit, Hapus)
 * Hanya boleh diakses oleh pengguna dengan role 'admin'
 */
warehouseRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, WarehouseController.create);
warehouseRouter.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, WarehouseController.update);
warehouseRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, WarehouseController.delete);

export default warehouseRouter;
