import type { RequestHandler } from 'express';
import { CourseService } from '../services/CourseService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError, NotFoundError } from '../utils/errors.js';

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const listCourses: RequestHandler = async (_req, res, next) => {
  try {
    const courses = await CourseService.listCourses();
    return ok(res, { courses });
  } catch (err) { next(err); }
};

export const getCourse: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    const course = await CourseService.getCourse(
      param(req.params.slugOrId),
      user?._id?.toString()
    );
    if (!course) throw new NotFoundError();
    return ok(res, { course });
  } catch (err) { next(err); }
};

export const enroll: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await CourseService.enroll(user._id.toString(), param(req.params.courseId));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const completeLesson: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await CourseService.completeLesson(
      user._id.toString(),
      param(req.params.courseId),
      param(req.params.lessonId)
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const passAssessment: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await CourseService.passAssessment(user._id.toString(), param(req.params.courseId));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listEnrolled: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const items = await CourseService.listEnrolled(user._id.toString());
    return ok(res, { items });
  } catch (err) { next(err); }
};
