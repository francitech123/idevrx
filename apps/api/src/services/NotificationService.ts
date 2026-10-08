import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

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
  async list(userId: string, limit = 30) {
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

  async unreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, readAt: null });
  },

  async markRead(userId: string, notificationId: string) {
    await Notification.updateOne(
      { _id: notificationId, userId },
      { $set: { readAt: new Date() } }
    );
    return { read: true };
  },

  async markAllRead(userId: string) {
    await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return { read: true };
  },
};
