import { Router } from 'express';
import * as ctrl from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { UploadIntentSchema } from '../validators/fileSchemas.js';

const router = Router({ mergeParams: true });

router.get('/', ctrl.listFiles);
router.get('/:fileId/download', ctrl.download);

router.post(
  '/upload-intent',
  requireAuth,
  requireRole('creator'),
  validateBody(UploadIntentSchema),
  ctrl.createUploadIntent
);

router.post(
  '/:fileId/finalize',
  requireAuth,
  requireRole('creator'),
  ctrl.finalizeUpload
);

router.delete(
  '/:fileId',
  requireAuth,
  requireRole('creator'),
  ctrl.deleteFile
);

export default router;
