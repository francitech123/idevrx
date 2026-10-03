import type { RequestHandler } from 'express';
import { FileService } from '../services/FileService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

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
        filename: req.body.filename,
        mimeType: req.body.mimeType,
        sizeBytes: req.body.sizeBytes,
        category: req.body.category,
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

    const file = await FileService.finalizeUpload({
      projectId: param(req.params.id),
      userId: user._id.toString(),
      fileId: param(req.params.fileId),
    });
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
    const requester = user ? { id: user._id.toString(), roles: user.roles } : null;
    const result = await FileService.getDownloadUrl(
      param(req.params.id),
      param(req.params.fileId),
      requester
    );
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};

export const deleteFile: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await FileService.deleteFile(
      param(req.params.id),
      param(req.params.fileId),
      user._id.toString(),
      user.roles,
      req
    );
    return ok(res, result);
  } catch (err) {
    next(err);
  }
};
