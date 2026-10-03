import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type FileCategory =
  | 'image' | 'video' | 'code' | 'cad' | 'document' | 'schematic' | 'dataset' | 'other';

const projectFileSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storageProvider: { type: String, required: true, default: 'b2' },
    bucket: { type: String, required: true },
    storageKey: { type: String, required: true, unique: true, index: true },
    originalFilename: { type: String, required: true, maxlength: 255 },
    mimeType: { type: String, required: true, maxlength: 100 },
    sizeBytes: { type: Number, required: true, min: 0 },
    checksum: { type: String, default: '' },
    category: {
      type: String,
      enum: ['image', 'video', 'code', 'cad', 'document', 'schematic', 'dataset', 'other'],
      required: true,
    },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    downloadEnabled: { type: Boolean, default: true },
    processingStatus: {
      type: String,
      enum: ['pending', 'ready', 'failed'],
      default: 'ready',
    },
  },
  { timestamps: true }
);

projectFileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

export type ProjectFileDoc = HydratedDocument<InferSchemaType<typeof projectFileSchema>>;

export const ProjectFile = mongoose.model('ProjectFile', projectFileSchema);
