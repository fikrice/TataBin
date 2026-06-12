import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router untuk rute Analitik / Dashboard Analytics
const analyticsRouter = Router();

/**
 * Endpoint ringkasan overview analitik
 */
analyticsRouter.get('/overview', AuthMiddleware.authenticate, AnalyticsController.getOverview);

/**
 * Endpoint data sebaran stok dikelompokkan per gudang
 */
analyticsRouter.get('/warehouse-stock', AuthMiddleware.authenticate, AnalyticsController.getStockByWarehouse);
analyticsRouter.get('/asset-stocks', AuthMiddleware.authenticate, AnalyticsController.getAssetStocks);

export default analyticsRouter;
