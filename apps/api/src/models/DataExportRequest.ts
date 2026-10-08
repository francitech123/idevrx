import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const dataExportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed', 'expired'],
      default: 'pending',
      index: true,
    },
    downloadUrl: { type: String, default: '', maxlength: 2000 },
    expiresAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, default: '' },
  },
  { timestamps: true }
);

dataExportSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type DataExportDoc = HydratedDocument<InferSchemaType<typeof dataExportSchema>>;

export const DataExportRequest = mongoose.model('DataExportRequest', dataExportSchema);
