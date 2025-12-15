import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createBusiness,
  getBusiness,
  getBusinessById,
  updateBusiness,
  deleteBusiness
} from '../controllers/businessController';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Business routes
// POST /api/business - Create new business
router.post('/', createBusiness);

// GET /api/business - Get all business with filtering and pagination
router.get('/', getBusiness);

// GET /api/business/:id - Get single business by ID
router.get('/:id', getBusinessById);

// PUT /api/business/:id - Update existing business
router.put('/:id', updateBusiness);

// DELETE /api/business/:id - Delete business
router.delete('/:id', deleteBusiness);

export default router;