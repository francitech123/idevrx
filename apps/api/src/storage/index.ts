import { env } from '../config/env.js';
import type { StorageService } from './StorageService.js';
import { UpstashStorageService } from './UpstashStorageService.js';
import { B2StorageService } from './B2StorageService.js';

function pick(): StorageService {
  switch (env.STORAGE_PROVIDER) {
    case 'upstash':
      return UpstashStorageService;
    case 'b2':
    case 'r2':
    case 's3':
      return B2StorageService;
    default:
      throw new Error(`Unsupported storage provider: ${env.STORAGE_PROVIDER}`);
  }
}

export const storage: StorageService = pick();
