import mongoose, { Schema } from 'mongoose';

const viewHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

viewHistorySchema.index({ userId: 1, projectId: 1 }, { unique: true });
viewHistorySchema.index({ userId: 1, viewedAt: -1 });

export const ViewHistory = mongoose.model('ViewHistory', viewHistorySchema);
