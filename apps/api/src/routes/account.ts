import { Router } from 'express';
import * as ctrl from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  ChangePasswordSchema,
  RequestPasswordResetSchema,
  ConfirmPasswordResetSchema,
  RequestAccountDeletionSchema,
} from '../validators/accountSchemas.js';
import rateLimit from 'express-rate-limit';
import { fail } from '../utils/apiResponse.js';

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    fail(res, 429, 'RATE_LIMITED', 'Too many attempts. Try again later.'),
});

const router = Router();

router.post(
  '/password/change',
  requireAuth,
  validateBody(ChangePasswordSchema),
  ctrl.changePassword
);

router.post(
  '/password/reset/request',
  resetLimiter,
  validateBody(RequestPasswordResetSchema),
  ctrl.requestPasswordReset
);

router.post(
  '/password/reset/confirm',
  resetLimiter,
  validateBody(ConfirmPasswordResetSchema),
  ctrl.confirmPasswordReset
);

router.post('/data-export', requireAuth, ctrl.requestDataExport);
router.get('/data-export/latest', requireAuth, ctrl.getLatestExport);

router.post(
  '/delete/request',
  requireAuth,
  validateBody(RequestAccountDeletionSchema),
  ctrl.requestAccountDeletion
);
router.post('/delete/cancel', requireAuth, ctrl.cancelAccountDeletion);
router.get('/status', requireAuth, ctrl.getAccountStatus);

export default router;
