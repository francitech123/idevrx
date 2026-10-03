import { z } from 'zod';

export const FileCategoryEnum = z.enum([
  'image', 'video', 'code', 'cad', 'document', 'schematic', 'dataset', 'other',
]);

// Per-category limits (bytes)
export const SIZE_LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024,      // 10 MB
  video: 500 * 1024 * 1024,     // 500 MB
  code: 50 * 1024 * 1024,       // 50 MB
  cad: 200 * 1024 * 1024,       // 200 MB
  document: 50 * 1024 * 1024,   // 50 MB
  schematic: 20 * 1024 * 1024,  // 20 MB
  dataset: 200 * 1024 * 1024,   // 200 MB
  other: 50 * 1024 * 1024,      // 50 MB
};

// MIME allowlist per category
export const MIME_ALLOWLIST: Record<string, RegExp> = {
  image: /^image\/(jpeg|png|webp|gif|svg\+xml)$/,
  video: /^video\/(mp4|webm|quicktime)$/,
  code: /^(application\/(zip|x-zip-compressed|json)|text\/(plain|javascript|x-python))$/,
  cad: /^(application\/(octet-stream|zip|step|stp|stl|acad)|model\/(stl|step))$/,
  document: /^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
  schematic: /^(image\/(png|jpeg)|application\/pdf)$/,
  dataset: /^(text\/csv|application\/(json|zip|x-zip-compressed))$/,
  other: /^.*$/,
};

export const UploadIntentSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive().max(500 * 1024 * 1024),
  category: FileCategoryEnum,
});

export type UploadIntentInput = z.infer<typeof UploadIntentSchema>;
