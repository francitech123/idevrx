import { Bucket } from '@upstash/blob';
import { env } from '../config/env.js';
import type { StorageService, UploadIntent } from './StorageService.js';

if (!env.UPSTASH_BLOB_TOKEN) {
  throw new Error('UpstashStorageService requires UPSTASH_BLOB_TOKEN');
}

// Build a Bucket client. The SDK reads the token from env by default,
// but passing it explicitly is fine and matches the pattern.
const bucket = new Bucket({ token: env.UPSTASH_BLOB_TOKEN });

export const UpstashStorageService: StorageService = {
  async generateUploadUrl({ storageKey, contentType, maxBytes }): Promise<UploadIntent> {
    // signedUploadUrl returns { url, headers, expiresAt }.
    // The headers are signed into the URL and must be sent verbatim by the client.
    const result = await bucket.signedUploadUrl(storageKey, {
      contentType,
      size: maxBytes,
      expiresIn: '10m', // Upstash caps write links at 10 minutes
    });

    return {
      url: result.url,
      storageKey,
      expiresIn: 600, // 10 minutes in seconds
      headers: (result.headers as Record<string, string>) ?? {},
    };
  },

  async generateDownloadUrl({ storageKey, expiresInSeconds }): Promise<string> {
    // signedReadUrl returns { url, expiresAt }. Read links default to 5 minutes.
    const result = await bucket.signedReadUrl(storageKey, {
      expiresIn: expiresInSeconds,
    });
    return result.url;
  },

  async headObject(storageKey) {
    try {
      // bucket.info() returns metadata about the object.
      const info = await bucket.info(storageKey);
      return {
        size: info.size,
        contentType: info.contentType ?? 'application/octet-stream',
      };
    } catch {
      // If the object doesn't exist, bucket.info throws. Return null to signal "not found".
      return null;
    }
  },

  async deleteObject(storageKey) {
    // bucket.del() removes one path. It treats "already gone" as success.
    await bucket.del(storageKey);
  },
};
