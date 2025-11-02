// src/routes/project.routes.js
import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controller.js';
import { authenticate, tenantIsolation } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication and tenant isolation
router.use(authenticate, tenantIsolation);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;