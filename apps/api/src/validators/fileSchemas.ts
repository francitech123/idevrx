import { z } from 'zod';

export const UploadIntentSchema = z.object({
  originalFilename: z.string().min(1).max(300),
  mimeType: z.string().min(1).max(150),
  sizeBytes: z.number().int().positive().max(500 * 1024 * 1024), // hard cap; per-category limits apply later
});

export type UploadIntentInput = z.infer<typeof UploadIntentSchema>;
