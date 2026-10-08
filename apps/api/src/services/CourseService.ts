import { Course } from '../models/Course.js';
import { CourseLesson } from '../models/CourseLesson.js';
import { CourseEnrollment } from '../models/CourseEnrollment.js';

function toCourseSummary(c: any, lessonCount: number) {
  return {
    id: c._id.toString(),
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    iconKey: c.iconKey,
    order: c.order,
    lessonCount,
  };
}

export const CourseService = {
  async listCourses() {
    const courses = await Course.find({ published: true }).sort({ order: 1 });
    const counts = await Promise.all(
      courses.map((c) => CourseLesson.countDocuments({ courseId: c._id }))
    );
    return courses.map((c, i) => toCourseSummary(c, counts[i] ?? 0));
  },

  async getCourse(slugOrId: string, userId?: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const course = isObjectId
      ? await Course.findById(slugOrId)
      : await Course.findOne({ slug: slugOrId });
    if (!course || !course.published) return null;

    const lessons = await CourseLesson.find({ courseId: course._id }).sort({ order: 1 });

    let enrollment = null;
    if (userId) {
      enrollment = await CourseEnrollment.findOne({ userId, courseId: course._id });
    }

    const completedLessonIds = enrollment?.completedLessonIds.map((id) => id.toString()) ?? [];

    return {
      id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      description: course.description,
      category: course.category,
      iconKey: course.iconKey,
      lessons: lessons.map((l) => ({
        id: l._id.toString(),
        order: l.order,
        title: l.title,
        description: l.description,
        durationMinutes: l.durationMinutes,
        completed: completedLessonIds.includes(l._id.toString()),
      })),
      enrollment: enrollment
        ? {
            enrolled: true,
            completedCount: enrollment.completedLessonIds.length,
            totalLessons: lessons.length,
            passedAssessmentAt: enrollment.passedAssessmentAt?.toISOString() ?? null,
            certificateIssuedAt: enrollment.certificateIssuedAt?.toISOString() ?? null,
          }
        : { enrolled: false, completedCount: 0, totalLessons: lessons.length },
    };
  },

  async enroll(userId: string, courseId: string) {
    const course = await Course.findById(courseId);
    if (!course || !course.published) {
      const err: any = new Error('Course not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    await CourseEnrollment.findOneAndUpdate(
      { userId, courseId },
      { $setOnInsert: { userId, courseId, startedAt: new Date() } },
      { upsert: true, new: true }
    );

    return { enrolled: true };
  },

  async completeLesson(userId: string, courseId: string, lessonId: string) {
    const enrollment = await CourseEnrollment.findOneAndUpdate(
      { userId, courseId },
      { $setOnInsert: { userId, courseId, startedAt: new Date() } },
      { upsert: true, new: true }
    );

    const already = enrollment.completedLessonIds.some((id) => id.toString() === lessonId);
    if (!already) enrollment.completedLessonIds.push(lessonId as any);

    await enrollment.save();
    return { completed: true };
  },

  async passAssessment(userId: string, courseId: string) {
    const enrollment = await CourseEnrollment.findOne({ userId, courseId });
    if (!enrollment) {
      const err: any = new Error('Not enrolled');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const now = new Date();
    enrollment.passedAssessmentAt = now;
    if (!enrollment.certificateIssuedAt) enrollment.certificateIssuedAt = now;
    enrollment.completedAt = now;
    await enrollment.save();
    return { passed: true, certificateIssuedAt: now.toISOString() };
  },

  async listEnrolled(userId: string) {
    const enrollments = await CourseEnrollment.find({ userId }).sort({ updatedAt: -1 });
    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });
    const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

    const counts = await Promise.all(
      courses.map((c) => CourseLesson.countDocuments({ courseId: c._id }))
    );
    const countMap = new Map(courses.map((c, i) => [c._id.toString(), counts[i] ?? 0]));

    return enrollments
      .map((e) => {
        const course = courseMap.get(e.courseId.toString());
        if (!course) return null;
        const total = countMap.get(e.courseId.toString()) ?? 0;
        const completed = e.completedLessonIds.length;
        return {
          course: toCourseSummary(course, total),
          completedCount: completed,
          totalLessons: total,
          percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
          certificateIssuedAt: e.certificateIssuedAt?.toISOString() ?? null,
        };
      })
      .filter(Boolean);
  },
};
