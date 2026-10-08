import { Project } from '../models/Project.js';
import { ProjectFile, type FileCategory } from '../models/ProjectFile.js';
import { storage } from '../storage/index.js';
import { AuditService } from './AuditService.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '../utils/errors.js';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_PROJECT,
  MIME_ALLOWLIST,
  detectCategory,
  sanitizeFilename,
  buildStorageKey,
} from '../utils/fileRules.js';

interface UploadIntentInput {
  projectId: string;
  userId: string;
  userRoles: string[];
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

interface FinalizeInput {
  projectId: string;
  fileId: string;
  userId: string;
  userRoles: string[];
}

interface DownloadRequestInput {
  projectId: string;
  fileId: string;
  requesterId: string | null;
  requesterRoles: string[];
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

export const FileService = {
  async createUploadIntent(input: UploadIntentInput, req?: any) {
    const project = await Project.findById(input.projectId);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== input.userId) {
      throw new ForbiddenError();
    }
    if (!input.userRoles.includes('creator')) {
      throw new ForbiddenError();
    }

    if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
      throw new ValidationError({ sizeBytes: 'Invalid file size' });
    }
    if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError({
        sizeBytes: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`,
      });
    }

    const category: FileCategory = detectCategory(input.mimeType);
    const allowed = MIME_ALLOWLIST[category] ?? [];
    if (!allowed.includes(input.mimeType.toLowerCase())) {
      throw new ValidationError({
        mimeType: `File type ${input.mimeType} is not allowed for ${category} uploads.`,
      });
    }

    const existing = await ProjectFile.countDocuments({
      projectId: project._id,
      deletedAt: null,
    });
    if (existing >= MAX_FILES_PER_PROJECT) {
      throw new ConflictError(
        `This project has reached its file limit of ${MAX_FILES_PER_PROJECT}.`
      );
    }

    const safeFilename = sanitizeFilename(input.originalFilename);
    const storageKey = buildStorageKey(project.projectNumber, safeFilename);

    const file = await ProjectFile.create({
      projectId: project._id,
      uploadedBy: input.userId,
      storageProvider: 'supabase',
      bucket: 'idevrx-pod',
      storageKey,
      originalFilename: safeFilename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      category,
      visibility: 'private',
      downloadEnabled: false,
      processingStatus: 'pending',
    });

    const presigned = await storage.createUploadUrl(storageKey, input.mimeType, input.sizeBytes);

    await AuditService.record({
      actorId: input.userId,
      actorRoles: input.userRoles,
      action: 'file.upload_intent_created',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: {
        projectId: project._id.toString(),
        filename: safeFilename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      },
      req,
    });

    return {
      fileId: file._id.toString(),
      uploadUrl: presigned.uploadUrl,
      expiresIn: presigned.expiresIn,
      storageKey,
    };
  },

  async finalizeUpload(input: FinalizeInput, req?: any) {
    const project = await Project.findById(input.projectId);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== input.userId) {
      throw new ForbiddenError();
    }

    const file = await ProjectFile.findOne({
      _id: input.fileId,
      projectId: project._id,
      deletedAt: null,
    });
    if (!file) throw new NotFoundError();

    if (file.processingStatus === 'ready') {
      return toPublicFile(file);
    }

    const head = await storage.headObject(file.storageKey);
    if (!head) {
      file.processingStatus = 'failed';
      await file.save();
      throw new ConflictError('Upload was not found in storage. It may have failed.');
    }

    if (head.sizeBytes > MAX_FILE_SIZE_BYTES) {
      await storage.deleteObject(file.storageKey).catch(() => {});
      await ProjectFile.deleteOne({ _id: file._id });
      throw new ValidationError({
        sizeBytes: 'Uploaded file exceeds the maximum allowed size.',
      });
    }

    file.sizeBytes = head.sizeBytes;
    file.mimeType = head.contentType || file.mimeType;
    file.processingStatus = 'ready';
    await file.save();

    await AuditService.record({
      actorId: input.userId,
      actorRoles: input.userRoles,
      action: 'file.finalized',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: {
        projectId: project._id.toString(),
        filename: file.originalFilename,
        sizeBytes: file.sizeBytes,
      },
      req,
    });

    return toPublicFile(file);
  },

  async listForProject(
    projectId: string,
    requester: { id: string; roles: string[] } | null
  ) {
    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError();

    const isOwner = requester && project.authorId.toString() === requester.id;
    const isPrivileged =
      requester &&
      (requester.roles.includes('moderator') ||
        requester.roles.includes('admin') ||
        requester.roles.includes('ceo'));

    const isPubliclyVisible =
      (project.status === 'published' || project.status === 'updated') &&
      project.visibility === 'public';

    if (!isPubliclyVisible && !isOwner && !isPrivileged) {
      throw new NotFoundError();
    }

    const query: any = { projectId: project._id, deletedAt: null, processingStatus: 'ready' };
    const files = await ProjectFile.find(query).sort({ createdAt: -1 });

    return files.map(toPublicFile);
  },

  async createDownloadUrl(input: DownloadRequestInput) {
    const project = await Project.findById(input.projectId);
    if (!project) throw new NotFoundError();

    const file = await ProjectFile.findOne({
      _id: input.fileId,
      projectId: project._id,
      deletedAt: null,
    });
    if (!file) throw new NotFoundError();

    if (file.processingStatus !== 'ready') {
      throw new ConflictError('This file is not ready for download.');
    }

    const isOwner = input.requesterId && project.authorId.toString() === input.requesterId;
    const isPrivileged =
      input.requesterId &&
      (input.requesterRoles.includes('moderator') ||
        input.requesterRoles.includes('admin') ||
        input.requesterRoles.includes('ceo'));

    const isPubliclyDownloadable =
      (project.status === 'published' || project.status === 'updated') &&
      project.visibility === 'public' &&
      file.downloadEnabled === true;

    if (!isPubliclyDownloadable && !isOwner && !isPrivileged) {
      throw new NotFoundError();
    }

    const presigned = await storage.createDownloadUrl(file.storageKey);

    await AuditService.record({
      actorId: input.requesterId ?? 'anonymous',
      actorRoles: input.requesterRoles,
      action: 'file.download_url_issued',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: {
        projectId: project._id.toString(),
        filename: file.originalFilename,
      },
    });

    return {
      downloadUrl: presigned.downloadUrl,
      expiresIn: presigned.expiresIn,
      filename: file.originalFilename,
    };
  },

  async removeFile(
    projectId: string,
    fileId: string,
    requester: { id: string; roles: string[] },
    req?: any
  ) {
    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError();

    if (project.authorId.toString() !== requester.id) {
      throw new ForbiddenError();
    }

    const file = await ProjectFile.findOne({
      _id: fileId,
      projectId: project._id,
      deletedAt: null,
    });
    if (!file) throw new NotFoundError();

    file.deletedAt = new Date();
    await file.save();

    storage.deleteObject(file.storageKey).catch((err) => {
      console.error('Failed to delete object from storage', { storageKey: file.storageKey, err });
    });

    await AuditService.record({
      actorId: requester.id,
      actorRoles: requester.roles,
      action: 'file.removed',
      resourceType: 'ProjectFile',
      resourceId: file._id.toString(),
      outcome: 'success',
      metadata: { projectId: project._id.toString(), filename: file.originalFilename },
      req,
    });

    return { removed: true };
  },

  toPublicFile,
};
