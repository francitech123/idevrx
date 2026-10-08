import { Router } from 'express';
import authRoutes from './auth.js';
import creatorRoutes, { adminCreatorRouter } from './creator.js';
import projectRoutes from './projects.js';
import categoryRoutes from './categories.js';
import statsRoutes from './stats.js';
import userRoutes from './users.js';
import profileRoutes from './profile.js';
import {
  feedRouter,
  commentRouter,
  meRouter,
} from './interactions.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminCreatorRouter);
router.use('/projects', projectRoutes);
router.use('/categories', categoryRoutes);
router.use('/stats', statsRoutes);
router.use('/profiles', profileRoutes);
router.use('/feed', feedRouter);
router.use('/users', userRoutes);
router.use('/comments', commentRouter);
router.use('/me', meRouter);

export default router;
