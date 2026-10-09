import { ProjectStep } from '../models/ProjectStep.js';
import { Project } from '../models/Project.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

function toPublic(s: any) {
  return {
    id: s._id.toString(),
    projectId: s.projectId.toString(),
    stepNumber: s.stepNumber,
    title: s.title,
    body: s.body,
    mediaFileIds: s.mediaFileIds.map((id: any) => id.toString()),
    warnings: s.warnings,
    notes: s.notes,
  };
}

async function verifyOwner(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError();
  if (project.authorId.toString() !== userId) throw new ForbiddenError();
  return project;
}

export const ProjectStepService = {
  async list(projectId: string) {
    const items = await ProjectStep.find({ projectId }).sort({ stepNumber: 1 });
    return items.map(toPublic);
  },

  async create(projectId: string, userId: string, input: any) {
    await verifyOwner(projectId, userId);
    if (!input.title || typeof input.title !== 'string') {
      throw new ValidationError({ title: 'Title is required' });
    }
    const last = await ProjectStep.findOne({ projectId }).sort({ stepNumber: -1 });
    const stepNumber = input.stepNumber ?? (last ? last.stepNumber + 1 : 1);

    const step = await ProjectStep.create({
      projectId,
      stepNumber,
      title: input.title.trim(),
      body: input.body ?? '',
      warnings: input.warnings ?? [],
      notes: input.notes ?? [],
    });
    return toPublic(step);
  },

  async update(id: string, userId: string, patch: any) {
    const step = await ProjectStep.findById(id);
    if (!step) throw new NotFoundError();
    await verifyOwner(step.projectId.toString(), userId);

    if (patch.title !== undefined) step.title = patch.title;
    if (patch.body !== undefined) step.body = patch.body;
    if (patch.stepNumber !== undefined) step.stepNumber = patch.stepNumber;
    if (patch.warnings !== undefined) step.warnings = patch.warnings;
    if (patch.notes !== undefined) step.notes = patch.notes;

    await step.save();
    return toPublic(step);
  },

  async remove(id: string, userId: string) {
    const step = await ProjectStep.findById(id);
    if (!step) throw new NotFoundError();
    await verifyOwner(step.projectId.toString(), userId);
    await ProjectStep.deleteOne({ _id: id });
    return { removed: true };
  },
};
