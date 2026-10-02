import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { fail } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      fields[issue.path.join('.') || '_'] = issue.message;
    }
    return fail(res, 400, 'VALIDATION_ERROR', 'The request could not be processed.', fields);
  }

  if (err instanceof AppError) {
    return fail(res, err.status, err.code as any, err.message, err.fields);
  }

  logger.error({ err }, 'Unhandled error');
  return fail(
    res,
    500,
    'INTERNAL_ERROR',
    isProd ? 'Something went wrong.' : String(err?.message ?? err)
  );
};
