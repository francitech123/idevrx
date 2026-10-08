import { Router } from 'express';
import * as ctrl from '../controllers/learningController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.listPaths);
router.get('/:slugOrId', ctrl.getPath);

router.post('/:pathId/enroll', requireAuth, ctrl.enroll);
router.get('/:pathId/progress', requireAuth, ctrl.progress);
router.post('/:pathId/lessons/:lessonId/complete', requireAuth, ctrl.completeLesson);

export default router;

export const meLearningRouter = Router();
meLearningRouter.get('/enrolled', requireAuth, ctrl.listEnrolled);
