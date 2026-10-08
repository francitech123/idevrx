import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const courseLessonSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    durationMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

courseLessonSchema.index({ courseId: 1, order: 1 });

courseLessonSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type CourseLessonDoc = HydratedDocument<InferSchemaType<typeof courseLessonSchema>>;

export const CourseLesson = mongoose.model('CourseLesson', courseLessonSchema);
