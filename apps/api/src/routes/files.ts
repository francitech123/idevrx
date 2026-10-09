import { Router, type RequestHandler } from 'express';
import * as ctrl from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { UploadIntentSchema } from '../validators/fileSchemas.js';
import rateLimit from 'express-rate-limit';
import { fail } from '../utils/apiResponse.js';

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    fail(res, 429, 'RATE_LIMITED', 'Too many uploads. Please try again later.'),
});

// Merge params so this router can be mounted at /projects/:id/files
const router = Router({ mergeParams: true });

router.get('/', ctrl.listFiles);

router.post(
  '/upload-intent',
  requireAuth,
  requireRole('creator'),
  uploadLimiter,
  validateBody(UploadIntentSchema),
  ctrl.createUploadIntent
);

router.post(
  '/:fileId/finalize',
  requireAuth,
  requireRole('creator'),
  ctrl.finalizeUpload
);
router.post(
  '/:fileId/set-cover',
  requireAuth,
  requireRole('creator'),
  ctrl.setCover
);

router.get('/:fileId/download', ctrl.download);

router.delete(
  '/:fileId',
  requireAuth,
  requireRole('creator'),
  ctrl.remove
);

export default router;
