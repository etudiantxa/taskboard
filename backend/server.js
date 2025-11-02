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

// 🧩 Gérer plusieurs origines CORS
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, '')) // supprime le slash final
  .filter(Boolean);

app.use((req, res, next) => {
  console.log('Incoming request origin:', req.headers.origin);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // autoriser les requêtes sans origine (ex: Postman, tests serveur)
      if (!origin) return callback(null, true);

      // vérifier si l'origine est dans la liste autorisée
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      } else {
        console.log(`❌ Origin non autorisée: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200, // pour compatibilité avec certains navigateurs
  })
);

app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskBoard API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ Allowed origins:', allowedOrigins);
});
