import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

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

  async listFollowing(userId: string, page = 1, limit = 24) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Follow.find({ followerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ followerId: userId }),
    ]);

    const userIds = rows.map((r) => r.followingId);
    const users = await User.find({ _id: { $in: userIds } }).select(
      'username displayName bio roles creatorStatus createdAt'
    );
    const map = new Map(users.map((u) => [u._id.toString(), u]));

    const items = await Promise.all(
      rows.map(async (r) => {
        const u = map.get(r.followingId.toString());
        if (!u) return null;
        return {
          id: u._id.toString(),
          username: u.username,
          displayName: u.displayName,
          bio: u.bio ?? '',
          roles: u.roles,
          creatorStatus: u.creatorStatus,
          followedAt: (r as any).createdAt?.toISOString?.() ?? null,
        };
      })
    );

    return {
      items: items.filter(Boolean),
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    };
  },
};
