import { z } from 'zod';

const DifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

const youtubeUrlPattern = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;

export const CreateProjectSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  shortDescription: z.string().max(500).trim().optional().default(''),
  description: z.string().max(20000).optional().default(''),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id').optional().nullable(),
  difficulty: DifficultyEnum.optional().nullable(),
  estimatedCost: z.number().min(0).max(10_000_000).optional().nullable(),
  currency: z.string().max(8).optional().default('USD'),
  estimatedBuildTime: z.string().max(100).optional().default(''),
  youtubeUrl: z
    .string()
    .max(500)
    .trim()
    .optional()
    .default('')
    .refine(
      (v) => v === '' || youtubeUrlPattern.test(v),
      'Must be a YouTube URL (youtube.com or youtu.be)'
    ),
});

export const UpdateProjectSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  shortDescription: z.string().max(500).trim().optional(),
  description: z.string().max(20000).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id').optional().nullable(),
  difficulty: DifficultyEnum.optional().nullable(),
  estimatedCost: z.number().min(0).max(10_000_000).optional().nullable(),
  currency: z.string().max(8).optional(),
  estimatedBuildTime: z.string().max(100).optional(),
  youtubeUrl: z
    .string()
    .max(500)
    .trim()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || youtubeUrlPattern.test(v),
      'Must be a YouTube URL (youtube.com or youtu.be)'
    ),
  version: z.string().max(32).optional(),
});

export const ListProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  authorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum(['draft', 'in_review', 'published', 'updated', 'archived', 'removed']).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
