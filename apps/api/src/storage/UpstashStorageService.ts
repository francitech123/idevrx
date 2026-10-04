import { Bucket } from '@upstash/blob';
import { env } from '../config/env.js';
import type { StorageService, UploadIntent } from './StorageService.js';

if (!env.UPSTASH_BLOB_TOKEN) {
  throw new Error('UpstashStorageService requires UPSTASH_BLOB_TOKEN');
}

const bucket = new Bucket({ token: env.UPSTASH_BLOB_TOKEN });

export const UpstashStorageService: StorageService = {
  async generateUploadUrl({ storageKey, contentType, maxBytes }): Promise<UploadIntent> {
    // signedUploadUrl returns { url, headers, expiresAt }.
    // The headers are pinned into the signature and MUST be sent by the client verbatim.
    const result = await bucket.signedUploadUrl(storageKey, {
      contentType,
      size: maxBytes,
    });

    return {
      url: result.url,
      storageKey,
      expiresIn: 600, // Upstash caps signed URLs at 10 minutes
      headers: (result.headers as Record<string, string>) ?? {},
    };
  },

  async generateDownloadUrl({ storageKey, expiresInSeconds }): Promise<string> {
    const result = await bucket.signedReadUrl(storageKey, {
      expiresIn: expiresInSeconds,
    });
    return result.url;
  },

  async headObject(storageKey) {
    try {
      const info = await bucket.info(storageKey);
      return {
        size: info.size,
        contentType: info.contentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  },

  async deleteObject(storageKey) {
    await bucket.del(storageKey);
  },
};
