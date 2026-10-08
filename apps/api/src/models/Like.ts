import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, projectId: 1 }, { unique: true });
likeSchema.index({ projectId: 1, createdAt: -1 });

export const Like = mongoose.model('Like', likeSchema);
