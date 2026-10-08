import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const commentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    deletedAt: { type: Date, default: null, index: true },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

commentSchema.index({ projectId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });

commentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type CommentDoc = HydratedDocument<InferSchemaType<typeof commentSchema>>;

export const Comment = mongoose.model('Comment', commentSchema);
