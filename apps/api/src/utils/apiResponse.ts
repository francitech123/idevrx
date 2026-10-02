import type { Response } from 'express';
import type { ApiSuccess, ApiErrorBody, ErrorCode } from '@idevrx/types';

export function ok<T>(res: Response, data: T, meta: Partial<ApiSuccess<T>['meta']> = {}) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    meta: { requestId: res.locals.requestId ?? 'unknown', ...meta },
  };
  return res.json(body);
}

export function fail(
  res: Response,
  status: number,
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>
) {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message, fields },
    meta: { requestId: res.locals.requestId ?? 'unknown' },
  };
  return res.status(status).json(body);
}
