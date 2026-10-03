import type { RequestHandler } from 'express';
import { CreatorApplicationService } from '../services/CreatorApplicationService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

/** Express 5 types req.params values as string | string[]. Route params are always strings here. */
function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const apply: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const result = await CreatorApplicationService.apply(
      { userId: user._id.toString(), ...req.body },
      req
    );
    return ok(res, { application: result });
  } catch (err) {
    next(err);
  }
};

export const getOwnApplication: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const application = await CreatorApplicationService.getOwnApplication(
      user._id.toString()
    );
    return ok(res, { application });
  } catch (err) {
    next(err);
  }
};

export const listApplications: RequestHandler = async (req, res, next) => {
  try {
    const query = (req as any).validatedQuery ?? {};
    const applications = await CreatorApplicationService.listForReview(query);
    return ok(res, { applications });
  } catch (err) {
    next(err);
  }
};

export const reviewApplication: RequestHandler = async (req, res, next) => {
  try {
    const reviewer = (req as any).user;
    if (!reviewer) throw new AuthRequiredError();

    const application = await CreatorApplicationService.review(
      {
        applicationId: param(req.params.id),
        reviewerId: reviewer._id.toString(),
        reviewerRoles: reviewer.roles,
        decision: req.body.decision,
        note: req.body.note,
      },
      req
    );
    return ok(res, { application });
  } catch (err) {
    next(err);
  }
};
