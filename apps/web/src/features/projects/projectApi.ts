import { api } from '@/api/client';

export type ProjectStatus =
  | 'draft'
  | 'in_review'
  | 'published'
  | 'updated'
  | 'archived'
  | 'removed';

export type ProjectVisibility = 'public' | 'unlisted' | 'private';

export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProjectListItem {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  coverFileId: string | null;
  youtubeUrl: string | null;
  difficulty: ProjectDifficulty | null;
  estimatedCost: number | null;
  currency: string;
  estimatedBuildTime: string | null;
  version: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  counts: {
    views: number;
    likes: number;
    bookmarks: number;
    comments: number;
  };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface ProjectDetail extends ProjectListItem {
  description: string;
  categoryId: string | null;
  tagIds: string[];
  featured: boolean;
}

export interface ListResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface CreateProjectInput {
  title: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  difficulty?: ProjectDifficulty | null;
  estimatedCost?: number | null;
  currency?: string;
  estimatedBuildTime?: string;
  youtubeUrl?: string;
}

export interface UpdateProjectInput {
  title?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string | null;
  difficulty?: ProjectDifficulty | null;
  estimatedCost?: number | null;
  currency?: string;
  estimatedBuildTime?: string;
  youtubeUrl?: string;
  version?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

interface EnvelopeWithMeta<T> {
  data: T;
  meta: { page?: number; limit?: number; total?: number; hasNextPage?: boolean; requestId: string };
}

function toList<T extends ProjectListItem>(
  envelope: EnvelopeWithMeta<{ projects: T[] }>
): ListResponse<T> {
  return {
    items: envelope.data.projects,
    page: envelope.meta.page ?? 1,
    limit: envelope.meta.limit ?? 20,
    total: envelope.meta.total ?? envelope.data.projects.length,
    hasNextPage: envelope.meta.hasNextPage ?? false,
  };
}

export const projectApi = {
  // Public: list published projects
  async list(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    authorId?: string;
  } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.categoryId) qs.set('categoryId', params.categoryId);
    if (params.authorId) qs.set('authorId', params.authorId);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    // api.get returns data only — we need meta too, so call fetch directly for this one
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/projects${query}`, {
      credentials: 'include',
    });
    const body = await res.json();
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Failed to load projects');
    }
    return toList(body);
  },

  // Public: get one by id, number, or slug
  async get(idOrNumber: string): Promise<ProjectDetail> {
    const result = await api.get<{ project: ProjectDetail }>(
      `/api/v1/projects/${encodeURIComponent(idOrNumber)}`
    );
    return result.project;
  },

  // Creator: list own projects (any status)
  async listMine(params: { page?: number; limit?: number; status?: ProjectStatus } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/projects/mine${query}`, {
      credentials: 'include',
    });
    const body = await res.json();
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Failed to load projects');
    }
    return toList(body);
  },

  // Creator: create
  async create(input: CreateProjectInput): Promise<ProjectDetail> {
    const result = await api.post<{ project: ProjectDetail }>('/api/v1/projects', input);
    return result.project;
  },

  // Creator + owner: update
  async update(id: string, patch: UpdateProjectInput): Promise<ProjectDetail> {
    const result = await api.patch<{ project: ProjectDetail }>(
      `/api/v1/projects/${encodeURIComponent(id)}`,
      patch
    );
    return result.project;
  },

  // Creator + owner: publish
  async publish(id: string): Promise<ProjectDetail> {
    const result = await api.post<{ project: ProjectDetail }>(
      `/api/v1/projects/${encodeURIComponent(id)}/publish`
    );
    return result.project;
  },

  // Creator + owner: unpublish
  async unpublish(id: string): Promise<ProjectDetail> {
    const result = await api.post<{ project: ProjectDetail }>(
      `/api/v1/projects/${encodeURIComponent(id)}/unpublish`
    );
    return result.project;
  },

  // Creator + owner: soft delete
  async remove(id: string): Promise<void> {
    await api.delete<{ removed: boolean }>(`/api/v1/projects/${encodeURIComponent(id)}`);
  },

  // Public: categories
  async listCategories(): Promise<Category[]> {
    const result = await api.get<{ categories: Category[] }>('/api/v1/categories');
    return result.categories;
  },
};
