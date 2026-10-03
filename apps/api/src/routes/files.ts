import { Router } from 'express';
import * as ctrl from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { UploadIntentSchema } from '../validators/fileSchemas.js';

const router = Router({ mergeParams: true });

// Public-ish: list files (visibility-respecting)
router.get('/', ctrl.listFiles);

// Public-ish: get signed download URL (permission-checked)
router.get('/:fileId/download', ctrl.download);

// Creator + owner only
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
