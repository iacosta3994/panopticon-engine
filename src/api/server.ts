import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../lib/config';
import logger from '../lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

import ingestionRoutes from './routes/ingestion';
import analysisRoutes from './routes/analysis';
import webhooksRoutes from './routes/webhooks';
import adminRoutes from './routes/admin';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API routes
app.use('/api/ingest', ingestionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Panopticon Engine API',
    version: '0.1.0',
    description: 'Intelligent surveillance and analysis system',
    endpoints: {
      health: '/health',
      ingestion: '/api/ingest',
      analysis: '/api/analysis',
      webhooks: '/api/webhooks',
      admin: '/api/admin',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Panopticon Engine API server started on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
