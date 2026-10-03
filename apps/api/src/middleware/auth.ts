import type { RequestHandler } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequiredError } from '../utils/errors.js';

export const SESSION_COOKIE = 'idevrx_session';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = (req as any).cookies?.[SESSION_COOKIE];
    if (!token) return next();
    const result = await AuthService.validateSession(token);
    if (!result) return next();
    (req as any).user = result.user;
    (req as any).sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!(req as any).user) return next(new AuthRequiredError());
  next();
};
