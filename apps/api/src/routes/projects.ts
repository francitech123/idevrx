import { Router } from 'express';
import * as ctrl from '../controllers/projectController.js';
import { requireAuth } from '../middleware/auth.js';
import fileRoutes from './files.js';
import { requireRole } from '../middleware/authorize.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsQuerySchema,
} from '../validators/projectSchemas.js';

const router = Router();

// --- Public ---
router.get('/', validateQuery(ListProjectsQuerySchema), ctrl.listPublic);

// --- Authenticated: own projects ---
router.get(
  '/mine',
  requireAuth,
  requireRole('creator'),
  validateQuery(ListProjectsQuerySchema),
  ctrl.listOwned
);

// --- Public: get by id, number, or slug ---
router.get('/:idOrNumber', ctrl.getOne);

// --- Creator-only: create ---
router.post(
  '/',
  requireAuth,
  requireRole('creator'),
  validateBody(CreateProjectSchema),
  ctrl.create
);

// --- Creator + ownership: update, publish, unpublish, delete ---
router.patch(
  '/:id',
  requireAuth,
  requireRole('creator'),
  validateBody(UpdateProjectSchema),
  ctrl.update
);

router.post(
  '/:id/publish',
  requireAuth,
  requireRole('creator'),
  ctrl.publish
);

router.post(
  '/:id/unpublish',
  requireAuth,
  requireRole('creator'),
  ctrl.unpublish
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('creator'),
  ctrl.softDelete
);

export default router;
