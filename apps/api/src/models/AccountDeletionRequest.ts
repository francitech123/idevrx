import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

const accountDeletionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    scheduledFor: { type: Date, required: true, index: true },
    reason: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

accountDeletionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type AccountDeletionDoc = HydratedDocument<InferSchemaType<typeof accountDeletionSchema>>;

export const AccountDeletionRequest = mongoose.model('AccountDeletionRequest', accountDeletionSchema);
