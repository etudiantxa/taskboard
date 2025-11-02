// src/routes/auth.routes.js
import express from 'express';
import { register, login, getCurrentUser, switchOrganization } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/switch-organization', authenticate, switchOrganization);

export default router;