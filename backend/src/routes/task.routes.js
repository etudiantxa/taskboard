// src/routes/task.routes.js
import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/task.controller.js';
import { authenticate, tenantIsolation } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication and tenant isolation
router.use(authenticate, tenantIsolation);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;