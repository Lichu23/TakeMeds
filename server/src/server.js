import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initializeDatabase } from './db/database.js';

// Import routes
import medicationRoutes from './routes/medications.js';
import logRoutes from './routes/logs.js';
import pushRoutes from './routes/push.js';
import settingsRoutes from './routes/settings.js';

// Import services
import { initializeScheduler } from './services/schedulerService.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Initialize database
try {
  initializeDatabase();
  initializeScheduler();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// API Routes
app.use('/api/medications', medicationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PillTime API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PillTime API',
    version: '1.0.0',
    description: 'Medication reminder and tracking system'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 PillTime Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💊 Ready to track medications!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close();
  process.exit(0);
});

export default app;
