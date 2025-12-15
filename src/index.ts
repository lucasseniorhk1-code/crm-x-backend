// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes';
import userRoutes from './routes/userRoutes';
import businessRoutes from './routes/businessRoutes';
import { 
  requestIdMiddleware, 
  errorHandler, 
  notFoundHandler 
} from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CRM is running',
    timestamp: new Date().toISOString(),
    request_id: (req as any).requestId
  });
});

// API routes
app.use('/api/accounts', accountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SERVER', 'SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SERVER', 'SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.serverStart(Number(PORT));
  logger.info('SERVER', `Health check available at http://localhost:${PORT}/health`);
  logger.info('SERVER', `API endpoints available at:`);
  logger.info('SERVER', `  - Accounts: http://localhost:${PORT}/api/accounts`);
  logger.info('SERVER', `  - Users: http://localhost:${PORT}/api/users`);
  logger.info('SERVER', `  - Business: http://localhost:${PORT}/api/business`);
});

export default app;