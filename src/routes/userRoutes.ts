import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// User routes
// POST /api/users - Create new user
router.post('/', createUser);

// GET /api/users - Get all users with filtering and pagination
router.get('/', getUsers);

// GET /api/users/:id - Get single user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update existing user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

export default router;