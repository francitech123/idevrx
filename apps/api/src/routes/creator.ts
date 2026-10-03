import { Router } from 'express';
import * as ctrl from '../controllers/creatorController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  ApplySchema,
  ReviewSchema,
  ListApplicationsQuerySchema,
} from '../validators/creatorSchemas.js';
import rateLimit from 'express-rate-limit';
import { fail } from '../utils/apiResponse.js';

const applyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    fail(res, 429, 'RATE_LIMITED', 'Too many applications. Please try again later.'),
});

const router = Router();

// --- User-facing ---
router.post(
  '/apply',
  requireAuth,
  applyLimiter,
  validateBody(ApplySchema),
  ctrl.apply
);
router.get('/application', requireAuth, ctrl.getOwnApplication);

// --- Admin-facing ---
router.get(
  '/admin/creator-applications',
  requireAuth,
  requireRole('moderator', 'admin', 'ceo'),
  validateQuery(ListApplicationsQuerySchema),
  ctrl.listApplications
);

router.post(
  '/admin/creator-applications/:id/review',
  requireAuth,
  requireRole('moderator', 'admin', 'ceo'),
  validateBody(ReviewSchema),
  ctrl.reviewApplication
);

export default router;
