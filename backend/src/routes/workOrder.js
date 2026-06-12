import { Router } from 'express';
import WorkOrderController from '../controllers/workOrder.js';
import AuthMiddleware from '../middlewares/auth.js';

const workOrderRouter = Router();

// Rute umum (dapat diakses oleh Admin & Crew)
workOrderRouter.get('/', AuthMiddleware.authenticate, WorkOrderController.getAll);
workOrderRouter.get('/:id', AuthMiddleware.authenticate, WorkOrderController.getById);
workOrderRouter.get('/:id/next-labels', AuthMiddleware.authenticate, WorkOrderController.getNextLabels);
workOrderRouter.get('/:id/suggestions', AuthMiddleware.authenticate, WorkOrderController.getFifoSuggestions);
workOrderRouter.post('/:id/scan', AuthMiddleware.authenticate, WorkOrderController.processScan);

// Rute khusus Admin
workOrderRouter.post('/', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, WorkOrderController.create);
workOrderRouter.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.authorizeAdmin, WorkOrderController.delete);

export default workOrderRouter;
