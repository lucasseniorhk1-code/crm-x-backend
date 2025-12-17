import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendOrderToERP } from '../controllers/integrationController';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// POST /api/integration/send-order - Send order to ERP
router.post('/send-order', sendOrderToERP);

export default router;
