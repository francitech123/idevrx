import type { RequestHandler } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { ok } from '../utils/apiResponse.js';

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await CategoryService.list();
    return ok(res, { categories });
  } catch (err) {
    next(err);
  }
};
