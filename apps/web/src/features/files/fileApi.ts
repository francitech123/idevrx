import { api } from '@/api/client';

export type FileCategory =
  | 'image' | 'video' | 'code' | 'cad' | 'document' | 'schematic' | 'dataset' | 'other';

export interface ProjectFile {
  id: string;
  projectId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: FileCategory;
  visibility: 'public' | 'private';
  downloadEnabled: boolean;
  processingStatus: 'pending' | 'ready' | 'failed';
  createdAt: string;
}

export interface UploadIntentResponse {
  uploadUrl: string;
  expiresIn: number;
  fileId: string;
  storageKey: string;
}

export interface DownloadResponse {
  url: string;
  expiresIn: number;
  filename: string;
}

export const fileApi = {
  async list(projectRef: string): Promise<ProjectFile[]> {
    const result = await api.get<{ files: ProjectFile[] }>(
      `/api/v1/projects/${encodeURIComponent(projectRef)}/files`
    );
    return result.files;
  },

  async createUploadIntent(
    projectRef: string,
    input: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      category: FileCategory;
    }
  ): Promise<UploadIntentResponse> {
    return api.post<UploadIntentResponse>(
      `/api/v1/projects/${encodeURIComponent(projectRef)}/files/upload-intent`,
      input
    );
  },

  async finalize(
    projectRef: string,
    fileId: string
  ): Promise<ProjectFile> {
    const result = await api.post<{ file: ProjectFile }>(
      `/api/v1/projects/${encodeURIComponent(projectRef)}/files/${fileId}/finalize`
    );
    return result.file;
  },

  async getDownloadUrl(
    projectRef: string,
    fileId: string
  ): Promise<DownloadResponse> {
    return api.get<DownloadResponse>(
      `/api/v1/projects/${encodeURIComponent(projectRef)}/files/${fileId}/download`
    );
  },

  async remove(projectRef: string, fileId: string): Promise<void> {
    await api.delete<{ removed: boolean }>(
      `/api/v1/projects/${encodeURIComponent(projectRef)}/files/${fileId}`
    );
  },

  /**
   * Full upload flow: intent → PUT to B2 → finalize.
   * The file goes directly from the browser to B2 (never through our API).
   */
  async uploadFile(
    projectRef: string,
    file: File,
    category: FileCategory,
    onProgress?: (percent: number) => void
  ): Promise<ProjectFile> {
    // 1. Get presigned URL
    const intent = await fileApi.createUploadIntent(projectRef, {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      category,
    });

    // 2. Upload directly to B2 using the presigned URL
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', intent.uploadUrl, true);
      // B2 accepts any content-type; setting it helps
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });

    // 3. Finalize — server verifies the object exists and creates the metadata record
    return fileApi.finalize(projectRef, intent.fileId);
  },
};
