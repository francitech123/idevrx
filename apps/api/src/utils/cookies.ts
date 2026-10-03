import type { Response } from 'express';
import { isProd } from '../config/env.js';
import { SESSION_COOKIE } from '../middleware/auth.js';

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
