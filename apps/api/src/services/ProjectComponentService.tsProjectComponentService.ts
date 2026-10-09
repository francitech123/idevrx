import { ProjectComponent } from '../models/ProjectComponent.js';
import { Project } from '../models/Project.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

function toPublic(c: any) {
  return {
    id: c._id.toString(),
    projectId: c.projectId.toString(),
    name: c.name,
    quantity: c.quantity,
    specification: c.specification,
    notes: c.notes,
    optional: c.optional,
    sourceUrl: c.sourceUrl,
    estimatedUnitCost: c.estimatedUnitCost,
    currency: c.currency,
    order: c.order,
  };
}

async function verifyOwner(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError();
  if (project.authorId.toString() !== userId) throw new ForbiddenError();
  return project;
}

export const ProjectComponentService = {
  async list(projectId: string) {
    const items = await ProjectComponent.find({ projectId }).sort({ order: 1, createdAt: 1 });
    return items.map(toPublic);
  },

  async create(projectId: string, userId: string, input: any) {
    await verifyOwner(projectId, userId);
    if (!input.name || typeof input.name !== 'string') {
      throw new ValidationError({ name: 'Name is required' });
    }
    const count = await ProjectComponent.countDocuments({ projectId });
    const component = await ProjectComponent.create({
      projectId,
      name: input.name.trim(),
      quantity: input.quantity ?? '1',
      specification: input.specification ?? '',
      notes: input.notes ?? '',
      optional: !!input.optional,
      sourceUrl: input.sourceUrl ?? '',
      estimatedUnitCost: input.estimatedUnitCost ?? null,
      currency: input.currency ?? 'USD',
      order: count,
    });
    return toPublic(component);
  },

  async update(id: string, userId: string, patch: any) {
    const component = await ProjectComponent.findById(id);
    if (!component) throw new NotFoundError();
    await verifyOwner(component.projectId.toString(), userId);

    if (patch.name !== undefined) component.name = patch.name;
    if (patch.quantity !== undefined) component.quantity = patch.quantity;
    if (patch.specification !== undefined) component.specification = patch.specification;
    if (patch.notes !== undefined) component.notes = patch.notes;
    if (patch.optional !== undefined) component.optional = !!patch.optional;
    if (patch.sourceUrl !== undefined) component.sourceUrl = patch.sourceUrl;
    if (patch.estimatedUnitCost !== undefined) {
      component.estimatedUnitCost = patch.estimatedUnitCost;
    }
    if (patch.currency !== undefined) component.currency = patch.currency;
    if (patch.order !== undefined) component.order = patch.order;

    await component.save();
    return toPublic(component);
  },

  async remove(id: string, userId: string) {
    const component = await ProjectComponent.findById(id);
    if (!component) throw new NotFoundError();
    await verifyOwner(component.projectId.toString(), userId);
    await ProjectComponent.deleteOne({ _id: id });
    return { removed: true };
  },
};
