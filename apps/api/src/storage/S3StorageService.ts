import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import type { StorageService, PresignedUpload, PresignedDownload } from './StorageService.js';

const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const DOWNLOAD_URL_EXPIRY_SECONDS = 60;     // 60 seconds

const client = new S3Client({
  region: env.SUPABASE_STORAGE_REGION,
  endpoint: env.SUPABASE_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: env.SUPABASE_S3_ACCESS_KEY,
    secretAccessKey: env.SUPABASE_STORAGE_SECRET_KEY,
  },
  // Supabase S3 requires path-style addressing
  forcePathStyle: true,
});

export const S3StorageService: StorageService = {
  async createUploadUrl(storageKey, contentType, maxBytes): Promise<PresignedUpload> {
    const command = new PutObjectCommand({
      Bucket: env.SUPABASE_STORAGE_BUCKET,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    return { uploadUrl, storageKey, expiresIn: UPLOAD_URL_EXPIRY_SECONDS };
  },

  async createDownloadUrl(storageKey, expiresIn = DOWNLOAD_URL_EXPIRY_SECONDS): Promise<PresignedDownload> {
    const command = new GetObjectCommand({
      Bucket: env.SUPABASE_STORAGE_BUCKET,
      Key: storageKey,
    });

    const downloadUrl = await getSignedUrl(client, command, { expiresIn });

    return { downloadUrl, expiresIn };
  },

  async headObject(storageKey) {
    try {
      const result = await client.send(
        new HeadObjectCommand({
          Bucket: env.SUPABASE_STORAGE_BUCKET,
          Key: storageKey,
        })
      );
      return {
        sizeBytes: result.ContentLength ?? 0,
        contentType: result.ContentType ?? 'application/octet-stream',
      };
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound') {
        return null;
      }
      throw err;
    }
  },

  async deleteObject(storageKey) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.SUPABASE_STORAGE_BUCKET,
        Key: storageKey,
      })
    );
  },
};
