// src/routes/organization.routes.js
import express from 'express';
import { 
  createOrganization, 
  getOrganizations, 
  getOrganizationById,
  updateOrganization,
  inviteMember
} from '../controllers/organization.controller.js';
import { authenticate, tenantIsolation, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createOrganization);
router.get('/', authenticate, getOrganizations);
router.get('/:id', authenticate, getOrganizationById);
router.put('/:id', authenticate, tenantIsolation, requireAdmin, updateOrganization);
router.post('/:id/invite', authenticate, tenantIsolation, requireAdmin, inviteMember);

export default router;