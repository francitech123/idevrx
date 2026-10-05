import { S3StorageService } from './S3StorageService.js';
import type { StorageService } from './StorageService.js';

export const storage: StorageService = S3StorageService;
export type { StorageService } from './StorageService.js';
