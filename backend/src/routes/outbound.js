import { Router } from 'express';
import OutboundController from '../controllers/outbound.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router untuk rute operasional Outbound
const outboundRouter = Router();

/**
 * Endpoint ringkasan stok per aset (untuk dropdown di form outbound)
 */
outboundRouter.get('/stock-summary', AuthMiddleware.authenticate, OutboundController.getStockSummary);

/**
 * Endpoint verifikasi label berdasarkan nomor referensi (simulasi scan)
 */
outboundRouter.get('/verify/:ref', AuthMiddleware.authenticate, OutboundController.verifyLabel);

/**
 * Endpoint proses barang keluar (FIFO)
 * Dapat diakses oleh Admin maupun Crew yang sudah login
 */
outboundRouter.post('/', AuthMiddleware.authenticate, OutboundController.processOutbound);

export default outboundRouter;
