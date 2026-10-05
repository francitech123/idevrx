import type { RequestHandler } from 'express';
import { StatsService } from '../services/StatsService.js';
import { ok } from '../utils/apiResponse.js';

export const getPublicStats: RequestHandler = async (_req, res, next) => {
  try {
    const stats = await StatsService.publicStats();
    return ok(res, stats);
  } catch (err) {
    next(err);
  }
};
