import type { RequestHandler } from 'express';
import { ProjectComponentService } from '../services/ProjectComponentService.js';
import { ProjectStepService } from '../services/ProjectStepService.js';
import { ProjectCodeService } from '../services/ProjectCodeService.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError } from '../utils/errors.js';

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export const listComponents: RequestHandler = async (req, res, next) => {
  try {
    const items = await ProjectComponentService.list(param(req.params.id));
    return ok(res, { components: items });
  } catch (err) { next(err); }
};

export const createComponent: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectComponentService.create(
      param(req.params.id),
      user._id.toString(),
      req.body
    );
    return ok(res, { component: item });
  } catch (err) { next(err); }
};

export const updateComponent: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectComponentService.update(
      param(req.params.componentId),
      user._id.toString(),
      req.body
    );
    return ok(res, { component: item });
  } catch (err) { next(err); }
};

export const deleteComponent: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await ProjectComponentService.remove(
      param(req.params.componentId),
      user._id.toString()
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listSteps: RequestHandler = async (req, res, next) => {
  try {
    const items = await ProjectStepService.list(param(req.params.id));
    return ok(res, { steps: items });
  } catch (err) { next(err); }
};

export const createStep: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectStepService.create(
      param(req.params.id),
      user._id.toString(),
      req.body
    );
    return ok(res, { step: item });
  } catch (err) { next(err); }
};

export const updateStep: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectStepService.update(
      param(req.params.stepId),
      user._id.toString(),
      req.body
    );
    return ok(res, { step: item });
  } catch (err) { next(err); }
};

export const deleteStep: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await ProjectStepService.remove(
      param(req.params.stepId),
      user._id.toString()
    );
    return ok(res, result);
  } catch (err) { next(err); }
};

export const listCode: RequestHandler = async (req, res, next) => {
  try {
    const items = await ProjectCodeService.list(param(req.params.id));
    return ok(res, { samples: items });
  } catch (err) { next(err); }
};

export const createCode: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectCodeService.create(
      param(req.params.id),
      user._id.toString(),
      req.body
    );
    return ok(res, { sample: item });
  } catch (err) { next(err); }
};

export const updateCode: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const item = await ProjectCodeService.update(
      param(req.params.codeId),
      user._id.toString(),
      req.body
    );
    return ok(res, { sample: item });
  } catch (err) { next(err); }
};

export const deleteCode: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await ProjectCodeService.remove(
      param(req.params.codeId),
      user._id.toString()
    );
    return ok(res, result);
  } catch (err) { next(err); }
};
