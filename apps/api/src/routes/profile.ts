import { Router } from 'express';
import * as ctrl from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { z } from 'zod';
import {
  UpdateProfileSchema,
  UpdatePreferencesSchema,
} from '../validators/interactionSchemas.js';

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

const router = Router();

router.get('/me', requireAuth, ctrl.getProfile);
router.patch('/me', requireAuth, validateBody(UpdateProfileSchema), ctrl.updateProfile);

router.get('/me/preferences', requireAuth, ctrl.getPreferences);
router.patch(
  '/me/preferences',
  requireAuth,
  validateBody(UpdatePreferencesSchema),
  ctrl.updatePreferences
);

router.get(
  '/:username/projects',
  validateQuery(ListQuerySchema),
  ctrl.listCreatorProjects
);

router.get('/:username', ctrl.getPublicProfile);

export default router;
