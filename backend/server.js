
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './src/routes/auth.routes.js';
import organizationRoutes from './src/routes/organization.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import taskRoutes from './src/routes/task.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS améliorée pour production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean); // Enlève les valeurs undefined

const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (Postman, apps mobiles)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.some(allowedOrigin => {
      // Supporter les URLs avec ou sans slash final
      const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      const normalizedAllowed = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;
      return normalizedOrigin === normalizedAllowed;
    })) {
      callback(null, true);
    } else {
      console.log('❌ CORS - Origine bloquée:', origin);
      console.log('📋 Origines autorisées:', allowedOrigins);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 heures de cache pour les preflight requests
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Log pour déboguer (à enlever en production si nécessaire)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Database Connection avec meilleure gestion d'erreur
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected');
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 Frontend URL:', process.env.FRONTEND_URL || 'Not set');
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1); // Arrêter le serveur si DB non connectée
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check amélioré
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TaskBoard API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Ne pas exposer les détails d'erreur en production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Allowed origins:`, allowedOrigins);
});