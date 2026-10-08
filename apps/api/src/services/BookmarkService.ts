import { Bookmark } from '../models/Bookmark.js';
import { Project } from '../models/Project.js';

export const BookmarkService = {
  async save(userId: string, projectId: string): Promise<{ saved: boolean; count: number }> {
    const project = await Project.findById(projectId);
    if (!project) {
      const err: any = new Error('Project not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const existing = await Bookmark.findOne({ userId, projectId });
    if (existing) {
      const count = await Bookmark.countDocuments({ projectId });
      return { saved: true, count };
    }

    await Bookmark.create({ userId, projectId });
    const count = await Bookmark.countDocuments({ projectId });
    await Project.updateOne({ _id: projectId }, { $set: { 'counts.bookmarks': count } });
    return { saved: true, count };
  },

  async remove(userId: string, projectId: string): Promise<{ saved: boolean; count: number }> {
    await Bookmark.deleteOne({ userId, projectId });
    const count = await Bookmark.countDocuments({ projectId });
    await Project.updateOne({ _id: projectId }, { $set: { 'counts.bookmarks': count } });
    return { saved: false, count };
  },

  async status(userId: string, projectId: string): Promise<{ saved: boolean; count: number }> {
    const [saved, count] = await Promise.all([
      Bookmark.exists({ userId, projectId }),
      Bookmark.countDocuments({ projectId }),
    ]);
    return { saved: !!saved, count };
  },
};
