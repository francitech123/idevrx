import type { RequestHandler } from 'express';
import { AccountService } from '../services/AccountService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.changePassword(
      user._id.toString(),
      req.body.currentPassword,
      req.body.newPassword
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const requestPasswordReset: RequestHandler = async (req, res, next) => {
  try {
    const result = await AccountService.requestPasswordReset(req.body.email);
    return ok(res, { requested: result.requested });
  } catch (err) { next(err); }
};

export const confirmPasswordReset: RequestHandler = async (req, res, next) => {
  try {
    const result = await AccountService.confirmPasswordReset(
      req.body.token,
      req.body.newPassword
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const requestDataExport: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.requestDataExport(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};

export const getLatestExport: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.getLatestExport(user._id.toString());
    return ok(res, { request: result });
  } catch (err) { next(err); }
};

export const requestAccountDeletion: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.requestAccountDeletion(
      user._id.toString(),
      req.body.reason ?? ''
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const cancelAccountDeletion: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.cancelAccountDeletion(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};

export const getAccountStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await AccountService.getAccountStatus(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};
