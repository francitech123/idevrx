import type { RequestHandler } from 'express';
import { AuthService } from '../services/authService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';
import { setSessionCookie, clearSessionCookie } from '../utils/cookies.js';

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { user, sessionToken } = await AuthService.register(req.body);
    setSessionCookie(res, sessionToken);
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { user, sessionToken } = await AuthService.login(req.body.email, req.body.password);
    setSessionCookie(res, sessionToken);
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const token = (req as any).sessionToken;
    if (token) await AuthService.revokeSession(token);
    clearSessionCookie(res);
    return ok(res, { loggedOut: true });
  } catch (err) {
    next(err);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    return ok(res, { user: AuthService.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};
