import { Router } from 'express';
import InboundController from '../controllers/inbound.js';
import AuthMiddleware from '../middlewares/auth.js';

// Inisialisasi router untuk rute operasional Inbound
const inboundRouter = Router();

/**
 * Endpoint proses barang masuk
 * Dapat diakses oleh Admin maupun Crew yang sudah login
 */
inboundRouter.post('/', AuthMiddleware.authenticate, InboundController.processInbound);

export default inboundRouter;
