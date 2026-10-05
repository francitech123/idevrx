import { Router } from 'express';
import authRoutes from './auth.js';
import creatorRoutes, { adminCreatorRouter } from './creator.js';
import projectRoutes from './projects.js';
import categoryRoutes from './categories.js';
import statsRoutes from './stats.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminCreatorRouter);
router.use('/projects', projectRoutes);
router.use('/categories', categoryRoutes);
router.use('/stats', statsRoutes);

export default router;
