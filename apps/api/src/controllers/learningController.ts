import type { RequestHandler } from 'express';
import { LearningService } from '../services/LearningService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError, NotFoundError } from '../utils/errors.js';

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const listPaths: RequestHandler = async (_req, res, next) => {
  try {
    const paths = await LearningService.listPaths();
    return ok(res, { paths });
  } catch (err) { next(err); }
};

export const getPath: RequestHandler = async (req, res, next) => {
  try {
    const path = await LearningService.getPath(param(req.params.slugOrId));
    if (!path) throw new NotFoundError();
    return ok(res, { path });
  } catch (err) { next(err); }
};

export const enroll: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LearningService.enroll(user._id.toString(), param(req.params.pathId));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const progress: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LearningService.getProgress(user._id.toString(), param(req.params.pathId));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const completeLesson: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await LearningService.completeLesson(
      user._id.toString(),
      param(req.params.pathId),
      param(req.params.lessonId)
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listEnrolled: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const items = await LearningService.listEnrolled(user._id.toString());
    return ok(res, { items });
  } catch (err) { next(err); }
};
