import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type NotificationType =
  | 'comment'
  | 'reply'
  | 'like'
  | 'bookmark'
  | 'follow'
  | 'publish'
  | 'system'
  | 'moderation';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['comment', 'reply', 'like', 'bookmark', 'follow', 'publish', 'system', 'moderation'],
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    message: { type: String, default: '', maxlength: 500 },
    link: { type: String, default: '', maxlength: 500 },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>> & {
  type: NotificationType;
};

export const Notification = mongoose.model('Notification', notificationSchema);
