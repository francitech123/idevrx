import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const learningPathSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    category: { type: String, default: '', maxlength: 64, index: true },
    iconKey: { type: String, default: '', maxlength: 64 },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

learningPathSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type LearningPathDoc = HydratedDocument<InferSchemaType<typeof learningPathSchema>>;

export const LearningPath = mongoose.model('LearningPath', learningPathSchema);
