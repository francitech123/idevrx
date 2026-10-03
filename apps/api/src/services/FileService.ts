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

/**
 * Resolve a project reference that may be:
 *  - a Mongo ObjectId (24 hex chars)
 *  - a project number (numeric string, e.g. "1")
 *  - a slug (e.g. "esp32-environmental-sensor")
 * Returns the Project document or null.
 */
async function resolveProject(idOrNumber: string) {
  // Numeric string → try projectNumber first
  if (/^\d+$/.test(idOrNumber)) {
    const byNumber = await Project.findOne({ projectNumber: Number(idOrNumber) });
    if (byNumber) return byNumber;
  }
  // 24-hex string → try ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(idOrNumber)) {
    const byId = await Project.findById(idOrNumber);
    if (byId) return byId;
  }
  // Fallback → try slug
  return Project.findOne({ slug: idOrNumber });
}

/**
 * Load the project and verify the requester owns it. Throws if not found or not owner.
 */
async function requireProjectOwnership(projectRef: string, userId: string) {
  const project = await resolveProject(projectRef);
  if (!project) throw new NotFoundError();
  if (project.authorId.toString() !== userId) throw new ForbiddenError();
  return project;
}

/**
 * Load the project and check the requester can see its files.
 * Returns the Project document if visible; throws NotFoundError otherwise.
 */
async function requireProjectVisibility(
  projectRef: string,
  requester: { id: string; roles: string[] } | null
) {
  const project = await resolveProject(projectRef);
  if (!project) throw new NotFoundError();

  const isOwner = requester && project.authorId.toString() === requester.id;
  const isPrivileged =
    requester &&
    (requester.roles.includes('moderator') ||
      requester.roles.includes('admin') ||
      requester.roles.includes('ceo'));

  const isPubliclyVisible = project.status === 'published' && project.visibility === 'public';

  if (!isPubliclyVisible && !isOwner && !isPrivileged) {
    // Return 404, not 403 — prevents enumeration (File 05 §40)
    throw new NotFoundError();
  }
  return project;
}

export const FileService = {
  async createUploadIntent(input: UploadIntentInput, req?: any) {
    const project = await requireProjectOwnership(input.projectId, input.userId);

    const maxBytes = SIZE_LIMITS[input.category];
    if (!maxBytes) throw new AppError(400, 'VALIDATION_ERROR', 'Unknown file category.');

    if (input.sizeBytes > maxBytes) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `File exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit for ${input.category}.`
      );
    }

    const mimePattern = MIME_ALLOWLIST[input.category];
    if (mimePattern && !mimePattern.test(input.mimeType)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `MIME type ${input.mimeType} is not allowed for ${input.category}.`
      );
    }

    const storageKey = generateStorageKey({
      projectNumber: project.projectNumber,
      category: input.category,
      originalFilename: input.filename,
    });

    const intent = await storage.generateUploadUrl({
      storageKey,
      contentType: input.mimeType,
      maxBytes,
    });

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
      metadata: {
        projectId: project._id.toString(),
        category: input.category,
        sizeBytes: input.sizeBytes,
      },
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
    const project = await requireProjectOwnership(input.projectId, input.userId);

    const file = await ProjectFile.findById(input.fileId);
    if (!file) throw new NotFoundError();
    if (file.uploadedBy.toString() !== input.userId) throw new ForbiddenError();
    if (file.projectId.toString() !== project._id.toString()) throw new ForbiddenError();

    const head = await storage.headObject(file.storageKey);
    if (!head) {
      file.processingStatus = 'failed';
      await file.save();
      throw new AppError(400, 'VALIDATION_ERROR', 'Upload was not found in storage. Please retry.');
    }

    file.sizeBytes = head.size;
    file.mimeType = head.contentType;
    file.processingStatus = 'ready';
    await file.save();

    return toPublicFile(file);
  },

  async listForProject(projectRef: string, requester: { id: string; roles: string[] } | null) {
    const project = await requireProjectVisibility(projectRef, requester);

    const files = await ProjectFile.find({
      projectId: project._id,
      processingStatus: 'ready',
    }).sort({ createdAt: -1 });

    return files.map(toPublicFile);
  },

  async getDownloadUrl(
    projectRef: string,
    fileId: string,
    requester: { id: string; roles: string[] } | null
  ) {
    const project = await requireProjectVisibility(projectRef, requester);

    // Reject bad fileId early with a clear error rather than a CastError
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) throw new NotFoundError();

    const file = await ProjectFile.findById(fileId);
    if (!file) throw new NotFoundError();
    if (file.projectId.toString() !== project._id.toString()) throw new NotFoundError();

    const isOwner = requester && project.authorId.toString() === requester.id;
    const isPrivileged =
      requester &&
      (requester.roles.includes('moderator') ||
        requester.roles.includes('admin') ||
        requester.roles.includes('ceo'));

    if (!file.downloadEnabled && !isOwner && !isPrivileged) throw new ForbiddenError();

    const url = await storage.generateDownloadUrl({
      storageKey: file.storageKey,
      expiresInSeconds: 300,
    });

    return { url, expiresIn: 300, filename: file.originalFilename };
  },

  async deleteFile(
    projectRef: string,
    fileId: string,
    userId: string,
    userRoles: string[],
    req?: any
  ) {
    const project = await requireProjectOwnership(projectRef, userId);

    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) throw new NotFoundError();

    const file = await ProjectFile.findById(fileId);
    if (!file) throw new NotFoundError();
    if (file.projectId.toString() !== project._id.toString()) throw new NotFoundError();

    try {
      await storage.deleteObject(file.storageKey);
    } catch {
      // Best-effort: log but continue; metadata removal still matters
    }

    await ProjectFile.deleteOne({ _id: file._id });

    await AuditService.record({
      actorId: userId,
      actorRoles: userRoles,
      action: 'file.deleted',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: { projectId: project._id.toString(), storageKey: file.storageKey },
      req,
    });

    return { removed: true };
  },
};
