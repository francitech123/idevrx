import { ProjectCodeSample } from '../models/ProjectCodeSample.js';
import { Project } from '../models/Project.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

function toPublic(c: any) {
  return {
    id: c._id.toString(),
    projectId: c.projectId.toString(),
    filename: c.filename,
    language: c.language,
    code: c.code,
    description: c.description,
    order: c.order,
  };
}

async function verifyOwner(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError();
  if (project.authorId.toString() !== userId) throw new ForbiddenError();
  return project;
}

export const ProjectCodeService = {
  async list(projectId: string) {
    const items = await ProjectCodeSample.find({ projectId }).sort({ order: 1 });
    return items.map(toPublic);
  },

  async create(projectId: string, userId: string, input: any) {
    await verifyOwner(projectId, userId);
    if (!input.filename || typeof input.filename !== 'string') {
      throw new ValidationError({ filename: 'Filename is required' });
    }
    if (!input.code || typeof input.code !== 'string') {
      throw new ValidationError({ code: 'Code is required' });
    }
    const count = await ProjectCodeSample.countDocuments({ projectId });
    const sample = await ProjectCodeSample.create({
      projectId,
      filename: input.filename.trim(),
      language: input.language ?? '',
      code: input.code,
      description: input.description ?? '',
      order: count,
    });
    return toPublic(sample);
  },

  async update(id: string, userId: string, patch: any) {
    const sample = await ProjectCodeSample.findById(id);
    if (!sample) throw new NotFoundError();
    await verifyOwner(sample.projectId.toString(), userId);

    if (patch.filename !== undefined) sample.filename = patch.filename;
    if (patch.language !== undefined) sample.language = patch.language;
    if (patch.code !== undefined) sample.code = patch.code;
    if (patch.description !== undefined) sample.description = patch.description;

    await sample.save();
    return toPublic(sample);
  },

  async remove(id: string, userId: string) {
    const sample = await ProjectCodeSample.findById(id);
    if (!sample) throw new NotFoundError();
    await verifyOwner(sample.projectId.toString(), userId);
    await ProjectCodeSample.deleteOne({ _id: id });
    return { removed: true };
  },
};
