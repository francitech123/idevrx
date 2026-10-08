import mongoose, { Schema } from 'mongoose';

const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, projectId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
