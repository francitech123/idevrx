import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type ProjectStatus =
  | 'draft'
  | 'in_review'
  | 'published'
  | 'updated'
  | 'archived'
  | 'removed';

export type ProjectVisibility = 'public' | 'unlisted' | 'private';
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

const projectStepSchema = new Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: '', maxlength: 4000 },
  },
  { _id: true }
);

const projectComponentSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 200 },
    quantity: { type: String, default: '', maxlength: 64 },
    purpose: { type: String, default: '', maxlength: 500 },
    optional: { type: Boolean, default: false },
  },
  { _id: true }
);

const projectCodeSampleSchema = new Schema(
  {
    filename: { type: String, required: true, maxlength: 200 },
    language: { type: String, default: 'text', maxlength: 40 },
    code: { type: String, default: '', maxlength: 100000 },
  },
  { _id: true }
);

const projectSchema = new Schema(
  {
    projectNumber: { type: Number, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100, index: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    shortDescription: { type: String, trim: true, maxlength: 500, default: '' },
    description: { type: String, default: '', maxlength: 20000 },

    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    tagIds: { type: [Schema.Types.ObjectId], ref: 'Tag', default: [] },

    status: {
      type: String,
      enum: ['draft', 'in_review', 'published', 'updated', 'archived', 'removed'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'private'],
      default: 'private',
      index: true,
    },

    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: null,
    },
    estimatedCost: { type: Number, default: null, min: 0 },
    currency: { type: String, default: 'USD', maxlength: 8 },
    estimatedBuildTime: { type: String, default: '', maxlength: 100 },
    buildLanguage: { type: String, default: '', maxlength: 64 },

    coverFileId: { type: Schema.Types.ObjectId, ref: 'ProjectFile', default: null, required: false },

    youtubeUrl: { type: String, default: '', maxlength: 500 },

    components: { type: [projectComponentSchema], default: [] },
    steps: { type: [projectStepSchema], default: [] },
    codeSamples: { type: [projectCodeSampleSchema], default: [] },

    version: { type: String, default: 'v0.1', maxlength: 32 },
    featured: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null, index: true },

    counts: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },

    searchText: { type: String, default: '' },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
projectSchema.index({ authorId: 1, status: 1 });
projectSchema.index({ title: 'text', shortDescription: 'text', searchText: 'text' });

projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type ProjectDoc = HydratedDocument<InferSchemaType<typeof projectSchema>> & {
  status: ProjectStatus;
  visibility: ProjectVisibility;
  difficulty: ProjectDifficulty | null;
};

export const Project = mongoose.model('Project', projectSchema);
