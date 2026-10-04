export interface UploadIntent {
  url: string;
  storageKey: string;
  expiresIn: number;
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
