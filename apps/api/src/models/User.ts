import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';
import type { Role, AccountStatus, CreatorStatus } from '@idevrx/types';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      index: true,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 64 },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 500 },
    avatarFileId: { type: Schema.Types.ObjectId, ref: 'ProjectFile', default: null },
    roles: {
      type: [String],
      enum: ['user', 'creator', 'moderator', 'admin', 'ceo'],
      default: ['user'],
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'restricted', 'deleted'],
      default: 'active',
      index: true,
    },
    creatorStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'revoked'],
      default: 'none',
    },
    preferences: { type: Schema.Types.Mixed, default: {} },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>> & {
  roles: Role[];
  accountStatus: AccountStatus;
  creatorStatus: CreatorStatus;
};

export const User = mongoose.model('User', userSchema);
