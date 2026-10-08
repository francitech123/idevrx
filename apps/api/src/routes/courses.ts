import { Router } from 'express';
import * as ctrl from '../controllers/courseController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.listCourses);
router.get('/:slugOrId', ctrl.getCourse);

router.post('/:courseId/enroll', requireAuth, ctrl.enroll);
router.post('/:courseId/lessons/:lessonId/complete', requireAuth, ctrl.completeLesson);
router.post('/:courseId/assessment/pass', requireAuth, ctrl.passAssessment);

export default router;

export const meCoursesRouter = Router();
meCoursesRouter.get('/courses/enrolled', requireAuth, ctrl.listEnrolled);
