import type { FileCategory } from '../models/ProjectFile.js';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB — Supabase Free tier cap
export const MAX_FILES_PER_PROJECT = 100;

/**
 * Per-category MIME allowlist (File 05 §22: "Validate declared MIME type").
 * Server-side. Never trust client-provided category.
 */
export const MIME_ALLOWLIST: Record<FileCategory, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  video: ['video/mp4', 'video/webm'],
  code: [
    'text/plain',
    'text/x-python',
    'application/json',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-tar',
    'application/gzip',
  ],
  cad: [
    'application/octet-stream',     // STL, STEP often reported as this
    'model/stl',
    'application/sla',
    'model/step',
    'application/zip',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain',
  ],
  schematic: ['application/pdf', 'image/png', 'image/jpeg', 'application/octet-stream'],
  dataset: ['text/csv', 'application/json', 'application/zip', 'application/x-zip-compressed'],
  other: ['application/octet-stream', 'application/zip', 'application/x-zip-compressed'],
};

/**
 * Detects category from MIME type. Returns 'other' if unrecognized.
 * Client does NOT choose the category — the server decides.
 */
export function detectCategory(mimeType: string): FileCategory {
  const m = mimeType.toLowerCase();
  for (const [category, mimes] of Object.entries(MIME_ALLOWLIST)) {
    if (mimes.includes(m)) return category as FileCategory;
  }
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  return 'other';
}

/**
 * Sanitize a filename for display. Removes path components and dangerous chars.
 * Never use the result as a storage key — that's generated separately.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/]/g, '')          // strip path separators
    .replace(/[^\w\s.\-()]/g, '')   // strip dangerous chars
    .trim()
    .slice(0, 200) || 'file';
}

/**
 * Generate a storage key. Never uses client filename directly (File 05 §22).
 * Pattern: projects/{projectNumber}/{uuid}.{ext}
 */
export function buildStorageKey(projectNumber: number, originalFilename: string): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
  const id = crypto.randomUUID();
  const path = `projects/project-${String(projectNumber).padStart(3, '0')}/${id}`;
  return ext ? `${path}.${ext}` : path;
}
