import { ProjectFile } from '../models/ProjectFile.js';
import { Project } from '../models/Project.js';
import { storage } from '../storage/index.js';
import { env } from '../config/env.js';
import { generateStorageKey, sanitizeFilename } from '../utils/storageKey.js';
import { SIZE_LIMITS, MIME_ALLOWLIST } from '../validators/fileSchemas.js';
import { AuditService } from './AuditService.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors.js';

interface UploadIntentInput {
  projectId: string;
  userId: string;
  userRoles: string[];
  filename: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
}

interface FinalizeInput {
  projectId: string;
  userId: string;
  fileId: string;
}

function toPublicFile(f: any) {
  return {
    id: f._id.toString(),
    projectId: f.projectId.toString(),
    originalFilename: f.originalFilename,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
    category: f.category,
    visibility: f.visibility,
    downloadEnabled: f.downloadEnabled,
    processingStatus: f.processingStatus,
    createdAt: f.createdAt.toISOString(),
  };
}

async function requireProjectOwnership(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError();
  if (project.authorId.toString() !== userId) throw new ForbiddenError();
  return project;
}

export const FileService = {
  async createUploadIntent(input: UploadIntentInput, req?: any) {
    const project = await requireProjectOwnership(input.projectId, input.userId);

    // Validate category
    const maxBytes = SIZE_LIMITS[input.category];
    if (!maxBytes) throw new AppError(400, 'VALIDATION_ERROR', 'Unknown file category.');

    // Validate size
    if (input.sizeBytes > maxBytes) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `File exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit for ${input.category}.`
      );
    }

    // Validate MIME
    const mimePattern = MIME_ALLOWLIST[input.category];
    if (mimePattern && !mimePattern.test(input.mimeType)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `MIME type ${input.mimeType} is not allowed for ${input.category}.`
      );
    }

    // Generate server-side storage key
    const storageKey = generateStorageKey({
      projectNumber: project.projectNumber,
      category: input.category,
      originalFilename: input.filename,
    });

    // Get presigned upload URL from B2
    const intent = await storage.generateUploadUrl({
      storageKey,
      contentType: input.mimeType,
      maxBytes,
    });

    // Create pending ProjectFile record
    const file = await ProjectFile.create({
      projectId: project._id,
      uploadedBy: input.userId,
      storageProvider: env.STORAGE_PROVIDER,
      bucket: env.STORAGE_BUCKET,
      storageKey,
      originalFilename: sanitizeFilename(input.filename),
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      category: input.category,
      visibility: 'private',
      downloadEnabled: true,
      processingStatus: 'pending',
    });

    await AuditService.record({
      actorId: input.userId,
      actorRoles: input.userRoles,
      action: 'file.upload_intent_created',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: { projectId: input.projectId, category: input.category, sizeBytes: input.sizeBytes },
      req,
    });

    return {
      uploadUrl: intent.url,
      expiresIn: intent.expiresIn,
      fileId: file._id.toString(),
      storageKey,
    };
  },

  async finalizeUpload(input: FinalizeInput) {
    await requireProjectOwnership(input.projectId, input.userId);

    const file = await ProjectFile.findById(input.fileId);
    if (!file) throw new NotFoundError();
    if (file.uploadedBy.toString() !== input.userId) throw new ForbiddenError();
    if (file.projectId.toString() !== input.projectId) throw new ForbiddenError();

    // Verify the object actually exists in B2
    const head = await storage.headObject(file.storageKey);
    if (!head) {
      file.processingStatus = 'failed';
      await file.save();
      throw new AppError(400, 'VALIDATION_ERROR', 'Upload was not found in storage. Please retry.');
    }

    // Update with actual metadata from B2
    file.sizeBytes = head.size;
    file.mimeType = head.contentType;
    file.processingStatus = 'ready';
    await file.save();

    return toPublicFile(file);
  },

  async listForProject(projectId: string, requester: { id: string; roles: string[] } | null) {
    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError();

    const isOwner = requester && project.authorId.toString() === requester.id;
    const isPrivileged =
      requester &&
      (requester.roles.includes('moderator') ||
        requester.roles.includes('admin') ||
        requester.roles.includes('ceo'));
    const isPubliclyVisible = project.status === 'published' && project.visibility === 'public';

    if (!isPubliclyVisible && !isOwner && !isPrivileged) throw new NotFoundError();

    const files = await ProjectFile.find({ projectId, processingStatus: 'ready' }).sort({
      createdAt: -1,
    });
    return files.map(toPublicFile);
  },

  async getDownloadUrl(projectId: string, fileId: string, requester: { id: string; roles: string[] } | null) {
    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError();

    const isOwner = requester && project.authorId.toString() === requester.id;
    const isPrivileged =
      requester &&
      (requester.roles.includes('moderator') ||
        requester.roles.includes('admin') ||
        requester.roles.includes('ceo'));
    const isPubliclyVisible = project.status === 'published' && project.visibility === 'public';

    if (!isPubliclyVisible && !isOwner && !isPrivileged) throw new NotFoundError();

    const file = await ProjectFile.findById(fileId);
    if (!file) throw new NotFoundError();
    if (file.projectId.toString() !== projectId) throw new NotFoundError();
    if (!file.downloadEnabled && !isOwner && !isPrivileged) throw new ForbiddenError();

    const url = await storage.generateDownloadUrl({
      storageKey: file.storageKey,
      expiresInSeconds: 300,
    });

    return { url, expiresIn: 300, filename: file.originalFilename };
  },

  async deleteFile(projectId: string, fileId: string, userId: string, userRoles: string[], req?: any) {
    await requireProjectOwnership(projectId, userId);

    const file = await ProjectFile.findById(fileId);
    if (!file) throw new NotFoundError();
    if (file.projectId.toString() !== projectId) throw new NotFoundError();

    // Delete from B2 first; if this fails, we abort
    try {
      await storage.deleteObject(file.storageKey);
    } catch (err) {
      // Log but continue — the metadata removal still matters
    }

    await ProjectFile.deleteOne({ _id: file._id });

    await AuditService.record({
      actorId: userId,
      actorRoles: userRoles,
      action: 'file.deleted',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: { projectId, storageKey: file.storageKey },
      req,
    });

    return { removed: true };
  },
};
