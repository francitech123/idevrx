import { Router } from 'express';
import * as ctrl from '../controllers/interactionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  CreateCommentSchema,
  UpdateCommentSchema,
  ListQuerySchema,
  FeedQuerySchema,
} from '../validators/interactionSchemas.js';
import rateLimit from 'express-rate-limit';
import { fail } from '../utils/apiResponse.js';

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => fail(res, 429, 'RATE_LIMITED', 'Too many comments.'),
});

const likeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => fail(res, 429, 'RATE_LIMITED', 'Too many likes.'),
});

export const feedRouter = Router();
feedRouter.get('/', validateQuery(FeedQuerySchema), ctrl.getFeed);

export const projectInteractionRouter = Router({ mergeParams: true });
projectInteractionRouter.post('/like', requireAuth, likeLimiter, ctrl.likeProject);
projectInteractionRouter.delete('/like', requireAuth, ctrl.unlikeProject);
projectInteractionRouter.get('/like', requireAuth, ctrl.likeStatus);

projectInteractionRouter.post('/bookmark', requireAuth, ctrl.bookmarkProject);
projectInteractionRouter.delete('/bookmark', requireAuth, ctrl.unbookmarkProject);
projectInteractionRouter.get('/bookmark', requireAuth, ctrl.bookmarkStatus);

projectInteractionRouter.get('/comments', ctrl.listComments);
projectInteractionRouter.post(
  '/comments',
  requireAuth,
  commentLimiter,
  validateBody(CreateCommentSchema),
  ctrl.createComment
);

projectInteractionRouter.post('/view', requireAuth, ctrl.recordHistory);

export const commentRouter = Router();
commentRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateCommentSchema),
  ctrl.updateComment
);
commentRouter.delete('/:id', requireAuth, ctrl.deleteComment);

export const userInteractionRouter = Router({ mergeParams: true });
userInteractionRouter.post('/follow', requireAuth, ctrl.followUser);
userInteractionRouter.delete('/follow', requireAuth, ctrl.unfollowUser);
userInteractionRouter.get('/follow', requireAuth, ctrl.followStatus);

export const meRouter = Router();
meRouter.get('/notifications', requireAuth, ctrl.listNotifications);
meRouter.post('/notifications/read-all', requireAuth, ctrl.markAllNotificationsRead);
meRouter.post('/notifications/:id/read', requireAuth, ctrl.markNotificationRead);
meRouter.get('/history', requireAuth, ctrl.listHistory);
meRouter.delete('/history', requireAuth, ctrl.clearHistory);
meRouter.get('/saved', requireAuth, validateQuery(ListQuerySchema), ctrl.listSaved);
meRouter.get('/liked', requireAuth, validateQuery(ListQuerySchema), ctrl.listLiked);
