import { Like } from '../models/Like.js';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';

export const LikeService = {
  async like(userId: string, projectId: string): Promise<{ liked: boolean; count: number }> {
    const project = await Project.findById(projectId);
    if (!project) {
      const err: any = new Error('Project not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const existing = await Like.findOne({ userId, projectId });
    if (existing) {
      const count = await Like.countDocuments({ projectId });
      return { liked: true, count };
    }

    await Like.create({ userId, projectId });
    const count = await Like.countDocuments({ projectId });
    await Project.updateOne({ _id: projectId }, { $set: { 'counts.likes': count } });

    if (project.authorId.toString() !== userId) {
      await Notification.create({
        userId: project.authorId,
        type: 'like',
        actorId: userId,
        projectId: project._id,
        message: 'Someone liked your project',
        link: `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`,
      });
    }

    return { liked: true, count };
  },

  async unlike(userId: string, projectId: string): Promise<{ liked: boolean; count: number }> {
    await Like.deleteOne({ userId, projectId });
    const count = await Like.countDocuments({ projectId });
    await Project.updateOne({ _id: projectId }, { $set: { 'counts.likes': count } });
    return { liked: false, count };
  },

  async status(userId: string, projectId: string): Promise<{ liked: boolean; count: number }> {
    const [liked, count] = await Promise.all([
      Like.exists({ userId, projectId }),
      Like.countDocuments({ projectId }),
    ]);
    return { liked: !!liked, count };
  },
};
