import type { RequestHandler } from 'express';
import { LikeService } from '../services/LikeService.js';
import { BookmarkService } from '../services/BookmarkService.js';
import { FollowService } from '../services/FollowService.js';
import { CommentService } from '../services/CommentService.js';
import { NotificationService } from '../services/NotificationService.js';
import { HistoryService } from '../services/HistoryService.js';
import { LibraryService } from '../services/LibraryService.js';
import { FeedService } from '../services/FeedService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const likeProject: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LikeService.like(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const unlikeProject: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LikeService.unlike(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const likeStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LikeService.status(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const bookmarkProject: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await BookmarkService.save(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const unbookmarkProject: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await BookmarkService.remove(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const bookmarkStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await BookmarkService.status(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const followUser: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await FollowService.follow(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const unfollowUser: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await FollowService.unfollow(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const followStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await FollowService.status(user._id.toString(), param(req.params.id));
    const counts = await FollowService.counts(param(req.params.id));
    return ok(res, { ...result, ...counts });
  } catch (err) { next(err); }
};

export const listComments: RequestHandler = async (req, res, next) => {
  try {
    const comments = await CommentService.listForProject(param(req.params.id));
    return ok(res, { comments });
  } catch (err) { next(err); }
};

export const createComment: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const comment = await CommentService.create({
      projectId: param(req.params.id),
      authorId: user._id.toString(),
      body: req.body.body,
      parentId: req.body.parentId ?? null,
    });
    return ok(res, { comment });
  } catch (err) { next(err); }
};

export const updateComment: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const comment = await CommentService.update(
      param(req.params.id),
      user._id.toString(),
      req.body.body
    );
    return ok(res, { comment });
  } catch (err) { next(err); }
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await CommentService.remove(
      param(req.params.id),
      user._id.toString(),
      user.roles
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listNotifications: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const notifications = await NotificationService.list(user._id.toString());
    const unread = await NotificationService.unreadCount(user._id.toString());
    return ok(res, { notifications, unread });
  } catch (err) { next(err); }
};

export const markNotificationRead: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await NotificationService.markRead(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const markAllNotificationsRead: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await NotificationService.markAllRead(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listHistory: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const items = await HistoryService.list(user._id.toString());
    return ok(res, { items });
  } catch (err) { next(err); }
};

export const clearHistory: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await HistoryService.clear(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};

export const recordHistory: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    await HistoryService.record(user._id.toString(), param(req.params.id));
    return ok(res, { recorded: true });
  } catch (err) { next(err); }
};

export const listSaved: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const page = Number((req as any).validatedQuery?.page ?? 1);
    const limit = Number((req as any).validatedQuery?.limit ?? 20);
    const result = await LibraryService.saved(user._id.toString(), page, limit);
    return ok(res, { items: result.items }, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) { next(err); }
};

export const listLiked: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const page = Number((req as any).validatedQuery?.page ?? 1);
    const limit = Number((req as any).validatedQuery?.limit ?? 20);
    const result = await LibraryService.liked(user._id.toString(), page, limit);
    return ok(res, { items: result.items }, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) { next(err); }
};

export const getFeed: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    const query = (req as any).validatedQuery ?? {};
    const result = await FeedService.feed({
      userId: user?._id?.toString(),
      following: query.following === 'true',
      page: query.page ?? 1,
      limit: query.limit ?? 12,
    });
    return ok(res, { items: result.items }, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) { next(err); }
};
