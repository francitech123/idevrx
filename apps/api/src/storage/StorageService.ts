/**
 * Provider-agnostic storage interface.
 * File 04 §38: "Keep storage operations behind a storage service interface."
 */
export interface PresignedUpload {
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface PresignedDownload {
  downloadUrl: string;
  expiresIn: number;
}

export interface StorageService {
  /**
   * Generate a presigned PUT URL for the client to upload directly.
   * Expiry: short — 5 minutes by default.
   */
  createUploadUrl(
    storageKey: string,
    contentType: string,
    maxBytes: number
  ): Promise<PresignedUpload>;

  /**
   * Generate a presigned GET URL for controlled download.
   * Expiry: short — 60 seconds by default.
   */
  createDownloadUrl(storageKey: string, expiresIn?: number): Promise<PresignedDownload>;

  /**
   * Verify an object exists in storage and return its real metadata.
   * Used to finalize uploads — never trust client-declared size/content-type.
   */
  headObject(
    storageKey: string
  ): Promise<{ sizeBytes: number; contentType: string } | null>;

  /**
   * Delete an object from storage.
   */
  deleteObject(storageKey: string): Promise<void>;
}
