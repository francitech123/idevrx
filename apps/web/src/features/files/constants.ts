import type { FileCategory } from './fileApi';

export const CATEGORY_LABELS: Record<FileCategory, string> = {
  image: 'Image',
  video: 'Video',
  code: 'Code',
  cad: 'CAD',
  document: 'Document',
  schematic: 'Schematic',
  dataset: 'Dataset',
  other: 'Other',
};

export const CATEGORY_LIMITS_MB: Record<FileCategory, number> = {
  image: 10,
  video: 500,
  code: 50,
  cad: 200,
  document: 50,
  schematic: 20,
  dataset: 200,
  other: 50,
};

export const CATEGORY_ACCEPT: Record<FileCategory, string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
  video: 'video/mp4,video/webm,video/quicktime',
  code: '.zip,.json,.js,.ts,.py,.txt,.ino',
  cad: '.stl,.step,.stp,.obj,.zip',
  document: 'application/pdf,.doc,.docx',
  schematic: 'image/png,image/jpeg,application/pdf',
  dataset: '.csv,.json,.zip',
  other: '*',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
