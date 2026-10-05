import { api } from '@/api/client';

export type FileCategory =
  | 'image'
  | 'video'
  | 'code'
  | 'cad'
  | 'document'
  | 'schematic'
  | 'dataset'
  | 'other';

export type ProcessingStatus = 'pending' | 'ready' | 'failed';

export interface ProjectFile {
  id: string;
  projectId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: FileCategory;
  visibility: 'public' | 'private';
  downloadEnabled: boolean;
  processingStatus: ProcessingStatus;
  createdAt: string;
}

export interface UploadIntentResponse {
  fileId: string;
  uploadUrl: string;
  expiresIn: number;
  storageKey: string;
}

export interface DownloadResponse {
  downloadUrl: string;
  expiresIn: number;
  filename: string;
}

export const fileApi = {
  async list(projectId: string): Promise<ProjectFile[]> {
    const result = await api.get<{ files: ProjectFile[] }>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/files`
    );
    return result.files;
  },

  async createUploadIntent(
    projectId: string,
    input: { originalFilename: string; mimeType: string; sizeBytes: number }
  ): Promise<UploadIntentResponse> {
    return api.post<UploadIntentResponse>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/files/upload-intent`,
      input
    );
  },

  async finalize(projectId: string, fileId: string): Promise<ProjectFile> {
    const result = await api.post<{ file: ProjectFile }>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(fileId)}/finalize`
    );
    return result.file;
  },

  async download(projectId: string, fileId: string): Promise<DownloadResponse> {
    return api.get<DownloadResponse>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(fileId)}/download`
    );
  },

  async remove(projectId: string, fileId: string): Promise<void> {
    await api.delete<{ removed: boolean }>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(fileId)}`
    );
  },
};

/**
 * Upload a file directly to Supabase Storage via the presigned PUT URL.
 * Uses XMLHttpRequest instead of fetch so we can track progress.
 */
export function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Upload failed: network error'));
    xhr.send(file);
  });
}
