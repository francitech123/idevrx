import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const codeSampleSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    filename: { type: String, required: true, maxlength: 200, trim: true },
    language: { type: String, default: '', maxlength: 40 },
    code: { type: String, required: true, maxlength: 100000 },
    description: { type: String, default: '', maxlength: 500 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

codeSampleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type ProjectCodeSampleDoc = HydratedDocument<InferSchemaType<typeof codeSampleSchema>>;

export const ProjectCodeSample = mongoose.model('ProjectCodeSample', codeSampleSchema);
