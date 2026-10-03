import type { RequestHandler } from 'express';
import { ProjectService } from '../services/ProjectService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

export const listPublic: RequestHandler = async (req, res, next) => {
  try {
    const query = (req as any).validatedQuery ?? {};
    const result = await ProjectService.listPublic(query);
    return ok(res, { projects: result.items }, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) {
    next(err);
  }
};

export const listOwned: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const query = (req as any).validatedQuery ?? {};
    const result = await ProjectService.listOwnedBy(user._id.toString(), query);
    return ok(res, { projects: result.items }, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getOne: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    const requester = user ? { id: user._id.toString(), roles: user.roles } : null;
    const project = await ProjectService.getVisible(req.params.idOrNumber, requester);
    return ok(res, { project });
  } catch (err) {
    next(err);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const project = await ProjectService.create(
      { authorId: user._id.toString(), ...req.body },
      req
    );
    return ok(res, { project });
  } catch (err) {
    next(err);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const project = await ProjectService.update(
      req.params.id,
      req.body,
      { id: user._id.toString(), roles: user.roles },
      req
    );
    return ok(res, { project });
  } catch (err) {
    next(err);
  }
};

export const publish: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const project = await ProjectService.publish(
      req.params.id,
      { id: user._id.toString(), roles: user.roles },
      req
    );
    return ok(res, { project });
  } catch (err) {
    next(err);
  }
};

export const unpublish: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const project = await ProjectService.unpublish(
      req.params.id,
      { id: user._id.toString(), roles: user.roles },
      req
    );
    return ok(res, { project });
  } catch (err) {
    next(err);
  }
};

export const softDelete: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await ProjectService.softDelete(
      req.params.id,
      { id: user._id.toString(), roles: user.roles },
      req
    );
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};
