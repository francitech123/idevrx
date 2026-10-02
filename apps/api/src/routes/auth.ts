import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { RegisterSchema, LoginSchema } from '../validators/authSchemas.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerLimiter, validateBody(RegisterSchema), ctrl.register);
router.post('/login', loginLimiter, validateBody(LoginSchema), ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

export default router;
