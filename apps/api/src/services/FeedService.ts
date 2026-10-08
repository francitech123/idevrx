import { Project } from '../models/Project.js';
import { Follow } from '../models/Follow.js';

interface FeedOptions {
  userId?: string;
  following?: boolean;
  page?: number;
  limit?: number;
}

function toPublicProject(p: any) {
  return {
    id: p._id.toString(),
    projectNumber: p.projectNumber,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    coverFileId: p.coverFileId?.toString() ?? null,
    youtubeUrl: p.youtubeUrl || null,
    difficulty: p.difficulty ?? null,
    estimatedCost: p.estimatedCost ?? null,
    currency: p.currency,
    estimatedBuildTime: p.estimatedBuildTime || null,
    version: p.version,
    status: p.status,
    visibility: p.visibility,
    counts: p.counts,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    authorId: p.authorId?.toString(),
    categoryId: p.categoryId?.toString() ?? null,
  };
}

export const FeedService = {
  async feed(options: FeedOptions) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(options.limit ?? 12, 30);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: { $in: ['published', 'updated'] },
      visibility: 'public',
    };

    if (options.following && options.userId) {
      const follows = await Follow.find({ followerId: options.userId }).select('followingId');
      const followingIds = follows.map((f) => f.followingId);
      if (followingIds.length === 0) {
        return { items: [], page, limit, total: 0, hasNextPage: false };
      }
      query.authorId = { $in: followingIds };
    }

    const [items, total] = await Promise.all([
      Project.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(query),
    ]);

    return {
      items: items.map(toPublicProject),
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    };
  },
};
