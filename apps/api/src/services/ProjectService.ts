import { Project, type ProjectStatus, type ProjectVisibility } from '../models/Project.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { nextSequence } from '../models/Counter.js';
import { slugify, uniqueSlug } from '../utils/slug.js';
import { AuditService } from './AuditService.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';

interface CreateProjectInput {
  authorId: string;
  title: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  difficulty?: string | null;
  estimatedCost?: number | null;
  currency?: string;
  estimatedBuildTime?: string;
  youtubeUrl?: string;
}

interface UpdateProjectInput {
  title?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  difficulty?: string | null;
  estimatedCost?: number | null;
  currency?: string;
  estimatedBuildTime?: string;
  youtubeUrl?: string;
  version?: string;
}

interface ListFilter {
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  categoryId?: string;
  authorId?: string;
  page?: number;
  limit?: number;
}

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

function toPublicDetail(p: any) {
  return {
    ...toPublicList(p),
    description: p.description,
    categoryId: p.categoryId?.toString() ?? null,
    tagIds: (p.tagIds ?? []).map((t: any) => t.toString()),
    featured: p.featured,
    buildLanguage: p.buildLanguage || null,
    components: (p.components ?? []).map((c: any) => ({
      id: c._id?.toString() ?? '',
      name: c.name,
      quantity: c.quantity,
      purpose: c.purpose,
      optional: c.optional,
    })),
    steps: (p.steps ?? []).map((s: any) => ({
      id: s._id?.toString() ?? '',
      order: s.order,
      title: s.title,
      body: s.body,
    })),
    codeSamples: (p.codeSamples ?? []).map((c: any) => ({
      id: c._id?.toString() ?? '',
      filename: c.filename,
      language: c.language,
      code: c.code,
    })),
  };
}

function toPublicDetail(p: any) {
  return {
    ...toPublicList(p),
    description: p.description,
    categoryId: p.categoryId?.toString() ?? null,
    tagIds: (p.tagIds ?? []).map((t: any) => t.toString()),
    featured: p.featured,
  };
}

async function findByIdOrNumber(idOrNumber: string) {
  if (/^\d+$/.test(idOrNumber)) {
    const byNumber = await Project.findOne({ projectNumber: Number(idOrNumber) });
    if (byNumber) return byNumber;
  }
  if (/^[0-9a-fA-F]{24}$/.test(idOrNumber)) {
    const byId = await Project.findById(idOrNumber);
    if (byId) return byId;
  }
  const bySlug = await Project.findOne({ slug: idOrNumber });
  return bySlug;
}

export const ProjectService = {
  async listPublic(filter: ListFilter = {}) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(filter.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const query: Record<string, unknown> = {
      status: { $in: ['published', 'updated'] },
      visibility: 'public',
    };
    if (filter.categoryId) query.categoryId = filter.categoryId;
    if (filter.authorId) query.authorId = filter.authorId;

    const [items, total] = await Promise.all([
      Project.find(query)
        .sort({ featured: -1, publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return {
      items: items.map(toPublicList),
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    };
  },

  async listOwnedBy(authorId: string, filter: ListFilter = {}) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(filter.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const query: Record<string, unknown> = { authorId };
    if (filter.status) query.status = filter.status;

    const [items, total] = await Promise.all([
      Project.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return {
      items: items.map(toPublicList),
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    };
  },

  async getVisible(idOrNumber: string, requester: { id: string; roles: string[] } | null) {
    const project = await findByIdOrNumber(idOrNumber);
    if (!project) throw new NotFoundError();

    const isOwner = requester && project.authorId.toString() === requester.id;
    const isPrivileged =
      requester &&
      (requester.roles.includes('moderator') ||
        requester.roles.includes('admin') ||
        requester.roles.includes('ceo'));

    const isPubliclyVisible =
      (project.status === 'published' || project.status === 'updated') &&
      project.visibility === 'public';

    if (isPubliclyVisible) return toPublicDetail(project);
    if (isOwner) return toPublicDetail(project);
    if (isPrivileged) return toPublicDetail(project);

    throw new NotFoundError();
  },

  async create(input: CreateProjectInput, req?: any) {
    const user = await User.findById(input.authorId);
    if (!user) throw new NotFoundError();

    if (!user.roles.includes('creator')) {
      throw new ForbiddenError();
    }

    if (input.categoryId) {
      const cat = await Category.findById(input.categoryId);
      if (!cat) throw new NotFoundError();
    }

        const project = await Project.create({
      projectNumber,
      slug,
      title: input.title,
      shortDescription: input.shortDescription ?? '',
      description: input.description ?? '',
      authorId: input.authorId,
      categoryId: input.categoryId ?? null,
      difficulty: input.difficulty ?? null,
      estimatedCost: input.estimatedCost ?? null,
      currency: input.currency ?? 'USD',
      estimatedBuildTime: input.estimatedBuildTime ?? '',
      buildLanguage: input.buildLanguage ?? '',
      youtubeUrl: input.youtubeUrl ?? '',
      components: input.components ?? [],
      steps: input.steps ?? [],
      codeSamples: input.codeSamples ?? [],
      status: 'draft',
      visibility: 'private',
      searchText: `${input.title} ${input.shortDescription ?? ''}`.toLowerCase(),
    });

    await AuditService.record({
      actorId: input.authorId,
      actorRoles: user.roles,
      action: 'project.created',
      resourceType: 'Project',
      resourceId: project._id.toString(),
      outcome: 'success',
      metadata: { projectNumber, title: input.title },
      req,
    });

    return toPublicDetail(project);
  },

  async update(
    id: string,
    patch: UpdateProjectInput,
    requester: { id: string; roles: string[] },
    req?: any
  ) {
    const project = await Project.findById(id);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== requester.id) {
      throw new ForbiddenError();
    }

    if (project.status === 'archived' || project.status === 'removed') {
      throw new ConflictError('This project is no longer editable.');
    }

    if (patch.categoryId !== undefined && patch.categoryId !== null) {
      const cat = await Category.findById(patch.categoryId);
      if (!cat) throw new NotFoundError();
    }

    if (patch.title !== undefined) project.title = patch.title;
    if (patch.shortDescription !== undefined) project.shortDescription = patch.shortDescription;
    if (patch.description !== undefined) project.description = patch.description;
    if (patch.categoryId !== undefined) project.categoryId = patch.categoryId as any;
    if (patch.difficulty !== undefined) project.difficulty = patch.difficulty as any;
    if (patch.estimatedCost !== undefined) project.estimatedCost = patch.estimatedCost as any;
    if (patch.currency !== undefined) project.currency = patch.currency;
    if (patch.estimatedBuildTime !== undefined) project.estimatedBuildTime = patch.estimatedBuildTime;
    if (patch.youtubeUrl !== undefined) project.youtubeUrl = patch.youtubeUrl;
    if (patch.version !== undefined) project.version = patch.version;

    project.searchText = `${project.title} ${project.shortDescription}`.toLowerCase();

    if (project.status === 'published') {
      project.status = 'updated';
    }

    await project.save();

    return toPublicDetail(project);
  },

  async publish(id: string, requester: { id: string; roles: string[] }, req?: any) {
    const project = await Project.findById(id);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== requester.id) {
      throw new ForbiddenError();
    }

    if (project.status === 'archived' || project.status === 'removed') {
      throw new ConflictError('This project cannot be published.');
    }

    if (!project.title || project.title.trim().length < 3) {
      throw new ConflictError('Project must have a title before publishing.');
    }
    if (!project.description || project.description.trim().length < 50) {
      throw new ConflictError('Project description must be at least 50 characters.');
    }

    project.status = 'published';
    project.visibility = 'public';
    project.publishedAt = project.publishedAt ?? new Date();

    await project.save();

    await AuditService.record({
      actorId: requester.id,
      actorRoles: requester.roles,
      action: 'project.published',
      resourceType: 'Project',
      resourceId: project._id.toString(),
      outcome: 'success',
      metadata: { projectNumber: project.projectNumber, title: project.title },
      req,
    });

    return toPublicDetail(project);
  },

  async unpublish(id: string, requester: { id: string; roles: string[] }, req?: any) {
    const project = await Project.findById(id);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== requester.id) {
      throw new ForbiddenError();
    }

    project.status = 'draft';
    project.visibility = 'private';
    await project.save();

    await AuditService.record({
      actorId: requester.id,
      actorRoles: requester.roles,
      action: 'project.unpublished',
      resourceType: 'Project',
      resourceId: project._id.toString(),
      outcome: 'success',
      req,
    });

    return toPublicDetail(project);
  },

  async softDelete(id: string, requester: { id: string; roles: string[] }, req?: any) {
    const project = await Project.findById(id);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== requester.id) {
      throw new ForbiddenError();
    }

    project.status = 'removed';
    await project.save();

    await AuditService.record({
      actorId: requester.id,
      actorRoles: requester.roles,
      action: 'project.removed',
      resourceType: 'Project',
      resourceId: project._id.toString(),
      outcome: 'success',
      req,
    });

    return { removed: true };
  },

  toPublicList,
  toPublicDetail,
};
