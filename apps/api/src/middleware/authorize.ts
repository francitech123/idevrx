import type { RequestHandler } from 'express';
import type { Role } from '@idevrx/types';
import { ForbiddenError } from '../utils/errors.js';

export const requireRole = (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    const user = (req as any).user;
    if (!user) return next(new ForbiddenError());
    const hasRole = roles.some((r: Role) => user.roles.includes(r));
    if (!hasRole) return next(new ForbiddenError());
    next();
  };

export const requireOwnership = (
  getOwnerId: (req: any) => Promise<string | null>,
  allowRoles: Role[] = ['admin']
): RequestHandler =>
  async (req, _res, next) => {
    try {
      const user = (req as any).user;
      if (!user) return next(new ForbiddenError());

      const ownerId = await getOwnerId(req);
      if (!ownerId) return next(new ForbiddenError());

      if (ownerId === user._id.toString()) return next();
      if (allowRoles.some((r) => user.roles.includes(r))) return next();

      return next(new ForbiddenError());
    } catch (err) {
      next(err);
    }
  };
