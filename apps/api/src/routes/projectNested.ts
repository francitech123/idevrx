import { Router } from 'express';
import * as ctrl from '../controllers/projectNestedController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';

export const componentsRouter = Router({ mergeParams: true });
componentsRouter.get('/', ctrl.listComponents);
componentsRouter.post('/', requireAuth, requireRole('creator'), ctrl.createComponent);

export const componentItemRouter = Router({ mergeParams: true });
componentItemRouter.patch('/', requireAuth, requireRole('creator'), ctrl.updateComponent);
componentItemRouter.delete('/', requireAuth, requireRole('creator'), ctrl.deleteComponent);

export const stepsRouter = Router({ mergeParams: true });
stepsRouter.get('/', ctrl.listSteps);
stepsRouter.post('/', requireAuth, requireRole('creator'), ctrl.createStep);

export const stepItemRouter = Router({ mergeParams: true });
stepItemRouter.patch('/', requireAuth, requireRole('creator'), ctrl.updateStep);
stepItemRouter.delete('/', requireAuth, requireRole('creator'), ctrl.deleteStep);

export const codeRouter = Router({ mergeParams: true });
codeRouter.get('/', ctrl.listCode);
codeRouter.post('/', requireAuth, requireRole('creator'), ctrl.createCode);

export const codeItemRouter = Router({ mergeParams: true });
codeItemRouter.patch('/', requireAuth, requireRole('creator'), ctrl.updateCode);
codeItemRouter.delete('/', requireAuth, requireRole('creator'), ctrl.deleteCode);
