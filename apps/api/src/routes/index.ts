import { Router } from 'express';
import authRoutes from './auth.js';
import creatorRoutes, { adminCreatorRouter } from './creator.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminCreatorRouter);

export default router;
