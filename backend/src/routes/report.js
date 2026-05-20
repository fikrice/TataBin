import { Router } from 'express';
import ReportController from '../controllers/report.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router untuk rute Laporan / Reporting
const reportRouter = Router();

/**
 * Endpoint mengambil log transaksi dengan filter
 */
reportRouter.get('/logs', AuthMiddleware.authenticate, ReportController.getLogs);

/**
 * Endpoint ekspor laporan transaksi ke Excel
 */
reportRouter.get('/export-excel', AuthMiddleware.authenticate, ReportController.exportExcel);

export default reportRouter;
