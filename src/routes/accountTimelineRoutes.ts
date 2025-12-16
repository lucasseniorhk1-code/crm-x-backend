import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createAccountTimeline,
  getAccountTimelines,
  getAccountTimelineById,
  updateAccountTimeline,
  deleteAccountTimeline,
  getAccountTimelineByAccountId
} from '../controllers/accountTimelineController';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Account Timeline routes
// POST /api/account-timeline - Create new account timeline record
router.post('/', createAccountTimeline);

// GET /api/account-timeline - Get all account timeline records with filtering and pagination
router.get('/', getAccountTimelines);

// GET /api/account-timeline/:id - Get single account timeline record by ID
router.get('/:id', getAccountTimelineById);

// PUT /api/account-timeline/:id - Update existing account timeline record
router.put('/:id', updateAccountTimeline);

// DELETE /api/account-timeline/:id - Delete account timeline record
router.delete('/:id', deleteAccountTimeline);

export default router;