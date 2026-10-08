import mongoose, { Schema } from 'mongoose';

const enrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pathId: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
    completedLessonIds: { type: [Schema.Types.ObjectId], default: [] },
    lastViewedLessonId: { type: Schema.Types.ObjectId, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, pathId: 1 }, { unique: true });

export const LearningEnrollment = mongoose.model('LearningEnrollment', enrollmentSchema);
