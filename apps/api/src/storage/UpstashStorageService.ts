import { env } from '../config/env.js';
import type { StorageService, UploadIntent } from './StorageService.js';

const UPSTASH_API_BASE = 'https://api.upstash.com';

interface SignedUploadResponse {
  url: string;
  path: string;
}

interface SignedReadResponse {
  url: string;
}

async function upstashFetch<T>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${UPSTASH_API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.UPSTASH_BLOB_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstash API error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const UpstashStorageService: StorageService = {
  async generateUploadUrl({ storageKey }): Promise<UploadIntent> {
    // Ask Upstash to sign a single-object upload URL.
    // Signed URLs expire in ~10 minutes by default.
    const response = await upstashFetch<SignedUploadResponse>(
      `/v2/blob/${encodeURIComponent(env.STORAGE_BUCKET)}/signed-upload-url`,
      {
        method: 'POST',
        body: JSON.stringify({ path: storageKey }),
      }
    );

    return {
      url: response.url,
      storageKey,
      expiresIn: 600,
    };
  },

  async generateDownloadUrl({ storageKey, expiresInSeconds }): Promise<string> {
    const response = await upstashFetch<SignedReadResponse>(
      `/v2/blob/${encodeURIComponent(env.STORAGE_BUCKET)}/signed-read-url`,
      {
        method: 'POST',
        body: JSON.stringify({ path: storageKey, expiresIn: expiresInSeconds }),
      }
    );
    return response.url;
  },

  async headObject(storageKey) {
    try {
      // Upstash Blob exposes object metadata via a HEAD-like endpoint.
      const response = await upstashFetch<{ size: number; contentType: string }>(
        `/v2/blob/${encodeURIComponent(env.STORAGE_BUCKET)}/head?path=${encodeURIComponent(
          storageKey
        )}`
      );
      return {
        size: response.size,
        contentType: response.contentType,
      };
    } catch {
      return null;
    }
  },

  async deleteObject(storageKey) {
    await upstashFetch(
      `/v2/blob/${encodeURIComponent(env.STORAGE_BUCKET)}/delete?path=${encodeURIComponent(
        storageKey
      )}`,
      { method: 'DELETE' }
    );
  },
};
