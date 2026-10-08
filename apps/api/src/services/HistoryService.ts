import { ViewHistory } from '../models/ViewHistory.js';

export const HistoryService = {
  async record(userId: string, projectId: string) {
    await ViewHistory.findOneAndUpdate(
      { userId, projectId },
      { $set: { viewedAt: new Date() } },
      { upsert: true }
    );
  },

  async list(userId: string, limit = 30) {
    const items = await ViewHistory.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(limit)
      .populate({
        path: 'projectId',
        select: 'projectNumber slug title shortDescription coverFileId difficulty estimatedBuildTime version counts publishedAt status visibility',
      });

    return items
      .filter((i) => i.projectId)
      .map((i) => {
        const p: any = i.projectId;
        return {
          id: p._id.toString(),
          projectNumber: p.projectNumber,
          slug: p.slug,
          title: p.title,
          shortDescription: p.shortDescription,
          coverFileId: p.coverFileId?.toString() ?? null,
          difficulty: p.difficulty ?? null,
          estimatedBuildTime: p.estimatedBuildTime ?? '',
          version: p.version,
          counts: p.counts,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          viewedAt: i.viewedAt.toISOString(),
        };
      });
  },

  async clear(userId: string) {
    await ViewHistory.deleteMany({ userId });
    return { cleared: true };
  },
};
