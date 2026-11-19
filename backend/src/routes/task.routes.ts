import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask
} from '../controllers/task.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All task routes require authentication
router.use(jwtAuthMiddleware);

// Get tasks with optional filters
router.get('/', getTasks);

// Create a new task
router.post('/', createTask);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

// Assign a task to a user
router.post('/:id/assign', assignTask); 

export default router;