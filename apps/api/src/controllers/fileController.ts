import type { RequestHandler } from 'express';
import { FileService } from '../services/FileService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

/** Express 5 types req.params values as string | string[]. */
function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const createUploadIntent: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const result = await FileService.createUploadIntent(
      {
        projectId: param(req.params.id),
        userId: user._id.toString(),
        userRoles: user.roles,
        originalFilename: req.body.originalFilename,
        mimeType: req.body.mimeType,
        sizeBytes: req.body.sizeBytes,
      },
      req
    );
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};

export const finalizeUpload: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const file = await FileService.finalizeUpload(
      {
        projectId: param(req.params.id),
        fileId: param(req.params.fileId),
        userId: user._id.toString(),
        userRoles: user.roles,
      },
      req
    );
    return ok(res, { file });
  } catch (err) {
    next(err);
  }
};

export const listFiles: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    const requester = user ? { id: user._id.toString(), roles: user.roles } : null;
    const files = await FileService.listForProject(param(req.params.id), requester);
    return ok(res, { files });
  } catch (err) {
    next(err);
  }
};

export const download: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    const result = await FileService.createDownloadUrl({
      projectId: param(req.params.id),
      fileId: param(req.params.fileId),
      requesterId: user ? user._id.toString() : null,
      requesterRoles: user ? user.roles : [],
    });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const result = await FileService.removeFile(
      param(req.params.id),
      param(req.params.fileId),
      { id: user._id.toString(), roles: user.roles },
      req
    );
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};
