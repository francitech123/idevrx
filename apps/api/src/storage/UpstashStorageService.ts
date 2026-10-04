import { Bucket } from '@upstash/blob';
import { env } from '../config/env.js';
import type { StorageService, UploadIntent } from './StorageService.js';

if (!env.UPSTASH_BLOB_TOKEN) {
  throw new Error('UpstashStorageService requires UPSTASH_BLOB_TOKEN');
}

const bucket = new Bucket({ token: env.UPSTASH_BLOB_TOKEN });

export const UpstashStorageService: StorageService = {
  async generateUploadUrl({ storageKey, contentType, maxBytes }): Promise<UploadIntent> {
    const result = await bucket.signedUploadUrl(storageKey, {
      contentType,
      size: maxBytes,
      expiresIn: '10m',
    });

    return {
      url: result.url,
      storageKey,
      expiresIn: 600,
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
