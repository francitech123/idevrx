export interface UploadIntent {
  url: string;
  storageKey: string;
  expiresIn: number;
  /**
   * Optional headers that MUST be sent verbatim by the client when uploading
   * to the presigned URL. Used by Upstash Blob, which pins these into the
   * signature — dropping, changing, or adding a header returns 403.
   */
  headers?: Record<string, string>;
}

export interface StorageService {
  generateUploadUrl(params: {
    storageKey: string;
    contentType: string;
    maxBytes: number;
  }): Promise<UploadIntent>;

  generateDownloadUrl(params: {
    storageKey: string;
    expiresInSeconds: number;
  }): Promise<string>;

  headObject(storageKey: string): Promise<{ size: number; contentType: string } | null>;

  deleteObject(storageKey: string): Promise<void>;
}
