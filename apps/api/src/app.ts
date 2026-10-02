import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestId } from './middleware/requestId.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => res.locals.requestId,
    })
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());

  app.use(authenticate);

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' }, meta: { requestId: 'health' } });
  });

  app.use('/api/v1', apiRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint not found.' },
      meta: { requestId: res.locals.requestId },
    });
  });

  app.use(errorHandler);

  return app;
}
