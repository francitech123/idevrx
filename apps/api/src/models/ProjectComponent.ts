import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const projectComponentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, maxlength: 200, trim: true },
    quantity: { type: String, default: '1', maxlength: 40 },
    specification: { type: String, default: '', maxlength: 500 },
    notes: { type: String, default: '', maxlength: 500 },
    optional: { type: Boolean, default: false },
    sourceUrl: { type: String, default: '', maxlength: 500 },
    estimatedUnitCost: { type: Number, default: null },
    currency: { type: String, default: 'USD', maxlength: 8 },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

projectComponentSchema.index({ projectId: 1, order: 1 });

projectComponentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type ProjectComponentDoc = HydratedDocument<InferSchemaType<typeof projectComponentSchema>>;

export const ProjectComponent = mongoose.model('ProjectComponent', projectComponentSchema);
