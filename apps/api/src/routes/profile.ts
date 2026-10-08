import { Router } from 'express';
import * as ctrl from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  UpdateProfileSchema,
  UpdatePreferencesSchema,
} from '../validators/interactionSchemas.js';

const router = Router();

router.get('/me', requireAuth, ctrl.getProfile);
router.patch(
  '/me',
  requireAuth,
  validateBody(UpdateProfileSchema),
  ctrl.updateProfile
);

router.get('/me/preferences', requireAuth, ctrl.getPreferences);
router.patch(
  '/me/preferences',
  requireAuth,
  validateBody(UpdatePreferencesSchema),
  ctrl.updatePreferences
);

router.get('/:username', ctrl.getPublicProfile);

export default router;
