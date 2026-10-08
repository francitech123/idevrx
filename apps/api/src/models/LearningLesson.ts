import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const learningLessonSchema = new Schema(
  {
    pathId: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    durationMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

learningLessonSchema.index({ pathId: 1, order: 1 });

learningLessonSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type LearningLessonDoc = HydratedDocument<InferSchemaType<typeof learningLessonSchema>>;

export const LearningLesson = mongoose.model('LearningLesson', learningLessonSchema);
