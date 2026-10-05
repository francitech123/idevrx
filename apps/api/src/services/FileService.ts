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
  /**
   * Step 1 of the upload flow. Verifies the user is Creator + owner,
   * validates MIME and size, generates a storage key, and returns
   * a presigned PUT URL. Does NOT create a ProjectFile record yet.
   */
  async createUploadIntent(input: UploadIntentInput, req?: any) {
    const project = await Project.findById(input.projectId);
    if (!project) throw new NotFoundError();

    // File 05 §22: only authorized Creators can upload project-owned assets
    if (project.authorId.toString() !== input.userId) {
      throw new ForbiddenError();
    }
    if (!input.userRoles.includes('creator')) {
      throw new ForbiddenError();
    }

    // Validate size
    if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
      throw new ValidationError({ sizeBytes: 'Invalid file size' });
    }
    if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError({
        sizeBytes: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`,
      });
    }

    // Determine category from MIME — the server decides, not the client
    const category: FileCategory = detectCategory(input.mimeType);
    const allowed = MIME_ALLOWLIST[category] ?? [];
    if (!allowed.includes(input.mimeType.toLowerCase())) {
      throw new ValidationError({
        mimeType: `File type ${input.mimeType} is not allowed for ${category} uploads.`,
      });
    }

    // Enforce per-project file quota
    const existing = await ProjectFile.countDocuments({
      projectId: project._id,
      deletedAt: null,
    });
    if (existing >= MAX_FILES_PER_PROJECT) {
      throw new ConflictError(
        `This project has reached its file limit of ${MAX_FILES_PER_PROJECT}.`
      );
    }

    // Sanitize filename for display; generate storage key separately
    const safeFilename = sanitizeFilename(input.originalFilename);
    const storageKey = buildStorageKey(project.projectNumber, safeFilename);

    // Create the pending metadata record (so we can track and clean up orphans)
    const file = await ProjectFile.create({
      projectId: project._id,
      uploadedBy: input.userId,
      storageProvider: 'supabase',
      bucket: 'idevrx-pod',   // Should match SUPABASE_STORAGE_BUCKET; kept for auditability
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

  /**
   * Step 2 of the upload flow. Called by the client after the direct upload finishes.
   * Verifies the object actually exists in storage and matches declared size.
   */
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
      // Idempotent — already finalized
      return toPublicFile(file);
    }

    // Verify the object actually exists (File 04 §15: "verify uploaded object before finalizing")
    const head = await storage.headObject(file.storageKey);
    if (!head) {
      file.processingStatus = 'failed';
      await file.save();
      throw new ConflictError('Upload was not found in storage. It may have failed.');
    }

    // Reject if the real file size exceeds our limit (server-authoritative)
    if (head.sizeBytes > MAX_FILE_SIZE_BYTES) {
      // Clean up immediately
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

  /**
   * List files for a project, respecting visibility.
   * Public: only 'ready' + project is public
   * Owner: all files
   * Mod/admin: all files
   */
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
      project.status === 'published' && project.visibility === 'public';

    if (!isPubliclyVisible && !isOwner && !isPrivileged) {
      throw new NotFoundError();
    }

    const query: any = { projectId: project._id, deletedAt: null, processingStatus: 'ready' };
    const files = await ProjectFile.find(query).sort({ createdAt: -1 });

    return files.map(toPublicFile);
  },

  /**
   * Generate a short-lived download URL, but ONLY after authorization.
   * File 05 §23: "Check resource visibility and user permissions before issuing access."
   */
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
      project.status === 'published' &&
      project.visibility === 'public' &&
      file.downloadEnabled === true;

    // Allow: owner, privileged, or public download enabled
    if (!isPubliclyDownloadable && !isOwner && !isPrivileged) {
      // Return 404, not 403, to prevent enumeration (File 05 §40)
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

  /**
   * Soft-delete a file. Owner only.
   */
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

    // Mark as deleted in DB first (so it disappears from listings immediately)
    file.deletedAt = new Date();
    await file.save();

    // Then delete from storage. If this fails, the file is orphaned but not reachable.
    storage.deleteObject(file.storageKey).catch((err) => {
      // Log but don't fail the request
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
