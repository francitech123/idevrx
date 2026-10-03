import crypto from 'node:crypto';
import path from 'node:path';

/**
 * Generate a safe, unpredictable storage key.
 * NEVER uses the raw client filename as the storage path (File 05 §22).
 */
export function generateStorageKey(params: {
  projectNumber: number;
  category: string;
  originalFilename: string;
}): string {
  const ext = path.extname(params.originalFilename).toLowerCase().slice(0, 10);
  const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '';
  const uuid = crypto.randomUUID();
  const projectFolder = `project-${String(params.projectNumber).padStart(3, '0')}`;
  return `projects/${projectFolder}/${params.category}/${uuid}${safeExt}`;
}

/**
 * Sanitize a filename for display purposes only.
 * Never used as a storage path.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 200)
    .trim();
}
