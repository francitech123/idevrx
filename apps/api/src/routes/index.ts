import { Router } from 'express';
import authRoutes from './auth.js';
import creatorRoutes, { adminCreatorRouter } from './creator.js';
import projectRoutes from './projects.js';
import categoryRoutes from './categories.js';
import statsRoutes from './stats.js';
import profileRoutes from './profile.js';
import userRoutes from './users.js';
import learningRoutes, { meLearningRouter } from './learning.js';
import coursesRoutes, { meCoursesRouter } from './courses.js';
import accountRoutes from './account.js';
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
router.use('/users', userRoutes);
router.use('/learning-paths', learningRoutes);
router.use('/courses', coursesRoutes);
router.use('/account', accountRoutes);
router.use('/feed', feedRouter);
router.use('/comments', commentRouter);

router.use('/me', meLearningRouter);
router.use('/me', meCoursesRouter);
router.use('/me', meRouter);

export default router;
