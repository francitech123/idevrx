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

const projectSchema = new Schema(
  {
    // Stable human-facing identity (File 01 §12, File 04 §8)
    projectNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    // URL slug (unique across all projects)
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      index: true,
    },

    // Core metadata
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: 20000,
    },

    // Ownership — server-authoritative (File 05 §15)
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Classification
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    tagIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Tag',
      default: [],
    },

    // Lifecycle (File 06 §3)
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

    // Engineering metadata
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: null,
    },
    estimatedCost: {
      type: Number,
      default: null,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 8,
    },
    estimatedBuildTime: {
      type: String,
      default: '',
      maxlength: 100,
    },

    // Media + external references
    coverFileId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectFile',
      default: null,
    },
    youtubeUrl: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Versioning
    version: {
      type: String,
      default: 'v0.1',
      maxlength: 32,
    },

    // Moderation/curation
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Timestamps
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Denormalized counters (File 04 §7)
    counts: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },

    // Full-text search
    searchText: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes for common queries
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
