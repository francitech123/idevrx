import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Follow } from '../models/Follow.js';
import { NotFoundError } from '../utils/errors.js';

function toPublicProfile(u: any, stats: { projectCount: number; followers: number; following: number }) {
  return {
    id: u._id.toString(),
    username: u.username,
    displayName: u.displayName,
    bio: u.bio ?? '',
    avatarUrl: null,
    roles: u.roles,
    creatorStatus: u.creatorStatus,
    createdAt: u.createdAt?.toISOString?.() ?? new Date().toISOString(),
    projectCount: stats.projectCount,
    followers: stats.followers,
    following: stats.following,
  };
}

export const ProfileService = {
  async getByUsernameOrId(key: string, requester: { id: string } | null) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(key);
    const user = isObjectId
      ? await User.findById(key)
      : await User.findOne({ username: key });

    if (!user) throw new NotFoundError();

    const [projectCount, followers, following, isFollowing] = await Promise.all([
      Project.countDocuments({
        authorId: user._id,
        status: { $in: ['published', 'updated'] },
        visibility: 'public',
      }),
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      requester
        ? Follow.exists({ followerId: requester.id, followingId: user._id })
        : Promise.resolve(null),
    ]);

    return {
      profile: toPublicProfile(user, { projectCount, followers, following }),
      isFollowing: !!isFollowing,
    };
  },

  async listProjects(
    key: string,
    page = 1,
    limit = 12
  ) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(key);
    const user = isObjectId
      ? await User.findById(key)
      : await User.findOne({ username: key });

    if (!user) throw new NotFoundError();

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(limit, 50);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      authorId: user._id,
      status: { $in: ['published', 'updated'] },
      visibility: 'public',
    };

    const [items, total] = await Promise.all([
      Project.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(query),
    ]);

    return {
      items: items.map((p: any) => ({
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
      })),
      page: pageNum,
      limit: limitNum,
      total,
      hasNextPage: pageNum * limitNum < total,
    };
  },
};
