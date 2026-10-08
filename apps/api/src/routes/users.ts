import { Router } from 'express';
import { userInteractionRouter } from './interactions.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use('/:id', requireAuth, userInteractionRouter);

export default router;
