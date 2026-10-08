import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { NotFoundError } from '../utils/errors.js';

function toPublic(n: any, actor?: any) {
  return {
    id: n._id.toString(),
    type: n.type,
    actorId: n.actorId?.toString() ?? null,
    projectId: n.projectId?.toString() ?? null,
    commentId: n.commentId?.toString() ?? null,
    message: n.message,
    link: n.link,
    read: !!n.readAt,
    createdAt: n.createdAt.toISOString(),
    actor: actor
      ? {
          id: actor._id.toString(),
          username: actor.username,
          displayName: actor.displayName,
        }
      : null,
  };
}

export const NotificationService = {
  async list(userId: string, limit = 50) {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const actorIds = Array.from(
      new Set(
        notifications.map((n) => n.actorId?.toString()).filter(Boolean) as string[]
      )
    );
    const actors = await User.find({ _id: { $in: actorIds } }).select(
      'username displayName'
    );
    const actorMap = new Map(actors.map((a) => [a._id.toString(), a]));

    return notifications.map((n) =>
      toPublic(n, n.actorId ? actorMap.get(n.actorId.toString()) : undefined)
    );
  },

  async get(userId: string, id: string) {
    const n = await Notification.findOne({ _id: id, userId });
    if (!n) throw new NotFoundError();
    const actor = n.actorId ? await User.findById(n.actorId).select('username displayName') : null;
    return toPublic(n, actor);
  },

  async unreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, readAt: null });
  },

  async markRead(userId: string, notificationId: string) {
    const n = await Notification.findOne({ _id: notificationId, userId });
    if (!n) throw new NotFoundError();
    if (!n.readAt) {
      n.readAt = new Date();
      await n.save();
    }
    const actor = n.actorId ? await User.findById(n.actorId).select('username displayName') : null;
    return toPublic(n, actor);
  },

  async markAllRead(userId: string) {
    await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return { read: true };
  },

  async remove(userId: string, notificationId: string) {
    const result = await Notification.deleteOne({ _id: notificationId, userId });
    if (result.deletedCount === 0) throw new NotFoundError();
    return { removed: true };
  },

  async removeAll(userId: string) {
    await Notification.deleteMany({ userId });
    return { removed: true };
  },
};
