import { LearningPath } from '../models/LearningPath.js';
import { LearningLesson } from '../models/LearningLesson.js';
import { LearningEnrollment } from '../models/LearningEnrollment.js';

function toPathSummary(p: any, lessonCount: number) {
  return {
    id: p._id.toString(),
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    iconKey: p.iconKey,
    order: p.order,
    lessonCount,
    createdAt: p.createdAt.toISOString(),
  };
}

export const LearningService = {
  async listPaths() {
    const paths = await LearningPath.find({ published: true }).sort({ order: 1 });
    const counts = await Promise.all(
      paths.map((p) => LearningLesson.countDocuments({ pathId: p._id }))
    );
    return paths.map((p, i) => toPathSummary(p, counts[i] ?? 0));
  },

  async getPath(slugOrId: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const path = isObjectId
      ? await LearningPath.findById(slugOrId)
      : await LearningPath.findOne({ slug: slugOrId });
    if (!path || !path.published) return null;

    const lessons = await LearningLesson.find({ pathId: path._id }).sort({ order: 1 });

    return {
      id: path._id.toString(),
      slug: path.slug,
      title: path.title,
      description: path.description,
      category: path.category,
      iconKey: path.iconKey,
      lessons: lessons.map((l) => ({
        id: l._id.toString(),
        order: l.order,
        title: l.title,
        description: l.description,
        projectId: l.projectId?.toString() ?? null,
        durationMinutes: l.durationMinutes,
      })),
    };
  },

  async enroll(userId: string, pathId: string) {
    const path = await LearningPath.findById(pathId);
    if (!path || !path.published) {
      const err: any = new Error('Path not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    await LearningEnrollment.findOneAndUpdate(
      { userId, pathId },
      { $setOnInsert: { userId, pathId, startedAt: new Date() } },
      { upsert: true, new: true }
    );

    return { enrolled: true };
  },

  async getProgress(userId: string, pathId: string) {
    const enrollment = await LearningEnrollment.findOne({ userId, pathId });
    if (!enrollment) return { enrolled: false, completedLessonIds: [] };
    return {
      enrolled: true,
      completedLessonIds: enrollment.completedLessonIds.map((id) => id.toString()),
      lastViewedLessonId: enrollment.lastViewedLessonId?.toString() ?? null,
      completedAt: enrollment.completedAt?.toISOString() ?? null,
    };
  },

  async completeLesson(userId: string, pathId: string, lessonId: string) {
    const enrollment = await LearningEnrollment.findOneAndUpdate(
      { userId, pathId },
      {
        $setOnInsert: { userId, pathId, startedAt: new Date() },
        $set: { lastViewedLessonId: lessonId },
      },
      { upsert: true, new: true }
    );

    const already = enrollment.completedLessonIds.some((id) => id.toString() === lessonId);
    if (!already) {
      enrollment.completedLessonIds.push(lessonId as any);
    }

    const totalLessons = await LearningLesson.countDocuments({ pathId });
    if (totalLessons > 0 && enrollment.completedLessonIds.length >= totalLessons) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    return { completed: true };
  },

  async listEnrolled(userId: string) {
    const enrollments = await LearningEnrollment.find({ userId }).sort({ updatedAt: -1 });
    if (enrollments.length === 0) return [];

    const pathIds = enrollments.map((e) => e.pathId);
    const paths = await LearningPath.find({ _id: { $in: pathIds } });
    const pathMap = new Map(paths.map((p) => [p._id.toString(), p]));

    const counts = await Promise.all(
      paths.map((p) => LearningLesson.countDocuments({ pathId: p._id }))
    );
    const countMap = new Map(paths.map((p, i) => [p._id.toString(), counts[i] ?? 0]));

    return enrollments
      .map((e) => {
        const path = pathMap.get(e.pathId.toString());
        if (!path) return null;
        const total = countMap.get(e.pathId.toString()) ?? 0;
        return {
          path: toPathSummary(path, total),
          completedLessonIds: e.completedLessonIds.map((id) => id.toString()),
          totalLessons: total,
          completedCount: e.completedLessonIds.length,
        };
      })
      .filter(Boolean);
  },
};
