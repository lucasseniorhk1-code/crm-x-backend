import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
} from '../controllers/itemController';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Item routes
// POST /api/items - Create new item
router.post('/', createItem);

// GET /api/items - Get all items with filtering and pagination
router.get('/', getItems);

// GET /api/items/:id - Get single item by ID
router.get('/:id', getItemById);

// PUT /api/items/:id - Update existing item
router.put('/:id', updateItem);

// DELETE /api/items/:id - Delete item
router.delete('/:id', deleteItem);

export default router;