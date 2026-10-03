import { Router } from 'express';
import authRoutes from './auth.js';
import creatorRoutes, { adminCreatorRouter } from './creator.js';
import projectRoutes from './projects.js';
import categoryRoutes from './categories.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminCreatorRouter);
router.use('/projects', projectRoutes);
router.use('/categories', categoryRoutes);

export default router;
