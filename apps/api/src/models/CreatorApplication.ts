import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'denied' | 'withdrawn';

const creatorApplicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    motivation: {
      type: String,
      required: true,
      trim: true,
      minlength: 40,
      maxlength: 2000,
    },
    experience: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// One active (pending) application per user
creatorApplicationSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
    name: 'one_pending_application_per_user',
  }
);

creatorApplicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type CreatorApplicationDoc = HydratedDocument<
  InferSchemaType<typeof creatorApplicationSchema>
> & {
  status: ApplicationStatus;
};

export const CreatorApplication = mongoose.model(
  'CreatorApplication',
  creatorApplicationSchema
);
