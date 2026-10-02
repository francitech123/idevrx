import type { RequestHandler } from 'express';
import { nanoid } from 'nanoid';

export const requestId: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string) || nanoid(16);
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
