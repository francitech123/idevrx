import { Router } from 'express';
import * as ctrl from '../controllers/projectController.js';
import fileRoutes from './files.js';
import {
  projectInteractionRouter,
  userInteractionRouter,
} from './interactions.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsQuerySchema,
} from '../validators/projectSchemas.js';

const router = Router();

router.get('/', validateQuery(ListProjectsQuerySchema), ctrl.listPublic);

router.get(
  '/mine',
  requireAuth,
  requireRole('creator'),
  validateQuery(ListProjectsQuerySchema),
  ctrl.listOwned
);

router.get('/:idOrNumber', ctrl.getOne);

router.post(
  '/',
  requireAuth,
  requireRole('creator'),
  validateBody(CreateProjectSchema),
  ctrl.create
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('creator'),
  validateBody(UpdateProjectSchema),
  ctrl.update
);

router.post('/:id/publish', requireAuth, requireRole('creator'), ctrl.publish);
router.post('/:id/unpublish', requireAuth, requireRole('creator'), ctrl.unpublish);
router.delete('/:id', requireAuth, requireRole('creator'), ctrl.softDelete);

router.use('/:id/files', fileRoutes);
router.use('/:id', projectInteractionRouter);

export default router;
