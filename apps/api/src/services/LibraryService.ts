import { Bookmark } from '../models/Bookmark.js';
import { Like } from '../models/Like.js';
import { Project } from '../models/Project.js';

async function mapProjects(projectIds: string[]) {
  if (projectIds.length === 0) return [];
  const projects = await Project.find({ _id: { $in: projectIds } });
  const map = new Map(projects.map((p) => [p._id.toString(), p]));

  return projectIds
    .map((id) => map.get(id))
    .filter(Boolean)
    .map((p: any) => ({
      id: p._id.toString(),
      projectNumber: p.projectNumber,
      slug: p.slug,
      title: p.title,
      shortDescription: p.shortDescription,
      coverFileId: p.coverFileId?.toString() ?? null,
      difficulty: p.difficulty ?? null,
      estimatedBuildTime: p.estimatedBuildTime ?? '',
      version: p.version,
      status: p.status,
      visibility: p.visibility,
      counts: p.counts,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }));
}

export const LibraryService = {
  async saved(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Bookmark.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bookmark.countDocuments({ userId }),
    ]);
    const projects = await mapProjects(items.map((b) => b.projectId.toString()));
    return { items: projects, page, limit, total, hasNextPage: page * limit < total };
  },

  async liked(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Like.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Like.countDocuments({ userId }),
    ]);
    const projects = await mapProjects(items.map((l) => l.projectId.toString()));
    return { items: projects, page, limit, total, hasNextPage: page * limit < total };
  },
};
