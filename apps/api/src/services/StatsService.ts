import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { ProjectFile } from '../models/ProjectFile.js';

export const StatsService = {
  async publicStats() {
    const [projects, creators, files] = await Promise.all([
      Project.countDocuments({
        status: { $in: ['published', 'updated'] },
        visibility: 'public',
      }),
      User.countDocuments({
        roles: 'creator',
        accountStatus: 'active',
      }),
      ProjectFile.countDocuments({
        processingStatus: 'ready',
        deletedAt: null,
      }),
    ]);

    return { projects, creators, files };
  },
};
