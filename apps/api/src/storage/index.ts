import { env } from '../config/env.js';
import type { StorageService } from './StorageService.js';

let cached: StorageService | null = null;

async function load(): Promise<StorageService> {
  if (cached) return cached;

  switch (env.STORAGE_PROVIDER) {
    case 'upstash': {
      const { UpstashStorageService } = await import('./UpstashStorageService.js');
      cached = UpstashStorageService;
      break;
    }
    case 'b2':
    case 'r2':
    case 's3': {
      const { B2StorageService } = await import('./B2StorageService.js');
      cached = B2StorageService;
      break;
    }
    default:
      throw new Error(`Unsupported storage provider: ${env.STORAGE_PROVIDER}`);
  }
  return cached;
}

/**
 * Async accessor — call `await storage()` at the top of any function
 * that needs to talk to object storage.
 */
export const storage = load;
