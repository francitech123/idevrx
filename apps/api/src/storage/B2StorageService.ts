import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import type { StorageService, UploadIntent } from './StorageService.js';

// B2/R2/S3 require these; env.ts validates them conditionally,
// but TS needs a local guard.
if (
  !env.STORAGE_REGION ||
  !env.STORAGE_ENDPOINT ||
  !env.STORAGE_ACCESS_KEY ||
  !env.STORAGE_SECRET_KEY
) {
  throw new Error(
    'B2StorageService requires STORAGE_REGION, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY'
  );
}

const client = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const B2StorageService: StorageService = {
  async generateUploadUrl({ storageKey, contentType, maxBytes }): Promise<UploadIntent> {
    const command = new PutObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: storageKey,
      ContentType: contentType,
      ContentLength: maxBytes,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 300 });
    return { url, storageKey, expiresIn: 300 };
  },

  async generateDownloadUrl({ storageKey, expiresInSeconds }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: storageKey,
    });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  },

  async headObject(storageKey) {
    try {
      const result = await client.send(new HeadObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: storageKey,
      }));
      return {
        size: result.ContentLength ?? 0,
        contentType: result.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  },

  async deleteObject(storageKey) {
    await client.send(new DeleteObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: storageKey,
    }));
  },
};
