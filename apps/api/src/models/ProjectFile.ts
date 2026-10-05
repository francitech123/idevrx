import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type FileCategory =
  | 'image'
  | 'video'
  | 'code'
  | 'cad'
  | 'document'
  | 'schematic'
  | 'dataset'
  | 'other';

export type FileVisibility = 'public' | 'private';

export type ProcessingStatus = 'pending' | 'ready' | 'failed';

const projectFileSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Storage reference
    storageProvider: {
      type: String,
      required: true,
      default: 'supabase',
    },
    bucket: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // File metadata
    originalFilename: {
      type: String,
      required: true,
      maxlength: 300,
    },
    mimeType: {
      type: String,
      required: true,
      maxlength: 150,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0,
    },
    checksum: {
      type: String,
      default: '',
    },

    // Classification
    category: {
      type: String,
      enum: ['image', 'video', 'code', 'cad', 'document', 'schematic', 'dataset', 'other'],
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
      index: true,
    },
    downloadEnabled: {
      type: Boolean,
      default: false,
    },

    // Lifecycle
    processingStatus: {
      type: String,
      enum: ['pending', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

projectFileSchema.index({ projectId: 1, deletedAt: 1 });

projectFileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    // Never expose raw storage keys to public responses
    delete ret.storageKey;
    delete ret.bucket;
    delete ret.storageProvider;
    return ret;
  },
});

export type ProjectFileDoc = HydratedDocument<
  InferSchemaType<typeof projectFileSchema>
> & {
  category: FileCategory;
  visibility: FileVisibility;
  processingStatus: ProcessingStatus;
};

export const ProjectFile = mongoose.model('ProjectFile', projectFileSchema);
