import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const projectStepSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    stepNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, maxlength: 200, trim: true },
    body: { type: String, default: '', maxlength: 5000 },
    mediaFileIds: { type: [Schema.Types.ObjectId], ref: 'ProjectFile', default: [] },
    warnings: { type: [String], default: [] },
    notes: { type: [String], default: [] },
  },
  { timestamps: true }
);

projectStepSchema.index({ projectId: 1, stepNumber: 1 }, { unique: true });

projectStepSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type ProjectStepDoc = HydratedDocument<InferSchemaType<typeof projectStepSchema>>;

export const ProjectStep = mongoose.model('ProjectStep', projectStepSchema);
