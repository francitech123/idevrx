import mongoose, { Schema } from 'mongoose';

const courseEnrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessonIds: { type: [Schema.Types.ObjectId], default: [] },
    passedAssessmentAt: { type: Date, default: null },
    certificateIssuedAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
