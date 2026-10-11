import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Project } from '../models/Project.js';

export const FollowService = {
  async follow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      const err: any = new Error('You cannot follow yourself.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const target = await User.findById(followingId);
    if (!target) {
      const err: any = new Error('User not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const existing = await Follow.findOne({ followerId, followingId });
    if (existing) return { following: true };

    await Follow.create({ followerId, followingId });

    await Notification.create({
      userId: followingId,
      type: 'follow',
      actorId: followerId,
      message: 'Someone started following you',
      link: '/settings',
    });

    return { following: true };
  },

  async unfollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    await Follow.deleteOne({ followerId, followingId });
    return { following: false };
  },

  async status(followerId: string, followingId: string): Promise<{ following: boolean }> {
    const following = await Follow.exists({ followerId, followingId });
    return { following: !!following };
  },

  async counts(userId: string): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      Follow.countDocuments({ followingId: userId }),
      Follow.countDocuments({ followerId: userId }),
    ]);
    return { followers, following };
  },

  async listFollowing(userId: string, page = 1, limit = 30) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(limit, 50);
    const skip = (pageNum - 1) * limitNum;

    const [follows, total] = await Promise.all([
      Follow.find({ followerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Follow.countDocuments({ followerId: userId }),
    ]);

    if (follows.length === 0) {
      return { items: [], page: pageNum, limit: limitNum, total: 0, hasNextPage: false };
    }

    const followingIds = follows.map((f) => f.followingId);
    const users = await User.find({ _id: { $in: followingIds } }).select(
      'username displayName bio roles creatorStatus createdAt'
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const projectCounts = await Promise.all(
      followingIds.map((id) =>
        Project.countDocuments({
          authorId: id,
          status: { $in: ['published', 'updated'] },
          visibility: 'public',
        })
      )
    );
    const projectCountMap = new Map(
      followingIds.map((id, i) => [id.toString(), projectCounts[i]])
    );

    const items = follows
      .map((f) => {
        const u = userMap.get(f.followingId.toString());
        if (!u) return null;
        return {
          id: u._id.toString(),
          username: u.username,
          displayName: u.displayName,
          bio: u.bio ?? '',
          roles: u.roles,
          creatorStatus: u.creatorStatus,
          projectCount: projectCountMap.get(f.followingId.toString()) ?? 0,
          followedAt: f.createdAt.toISOString(),
        };
      })
      .filter(Boolean);

    return {
      items,
      page: pageNum,
      limit: limitNum,
      total,
      hasNextPage: pageNum * limitNum < total,
    };
  },
};
