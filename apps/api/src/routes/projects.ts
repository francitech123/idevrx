import { Router } from 'express';
import * as ctrl from '../controllers/projectController.js';
import fileRoutes from './files.js';
import {
  projectInteractionRouter,
} from './interactions.js';
import {
  componentsRouter,
  componentItemRouter,
  stepsRouter,
  stepItemRouter,
  codeRouter,
  codeItemRouter,
} from './projectNested.js';
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
router.use('/:id/components', componentsRouter);
router.use('/:id/components/:componentId', componentItemRouter);
router.use('/:id/steps', stepsRouter);
router.use('/:id/steps/:stepId', stepItemRouter);
router.use('/:id/code', codeRouter);
router.use('/:id/code/:codeId', codeItemRouter);
router.use('/:id', projectInteractionRouter);

export default router;
