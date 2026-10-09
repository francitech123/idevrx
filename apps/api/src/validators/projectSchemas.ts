import { z } from 'zod';

const DifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

const youtubeUrlPattern = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;

const ComponentSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  quantity: z.string().max(64).trim().optional().default(''),
  purpose: z.string().max(500).trim().optional().default(''),
  optional: z.boolean().optional().default(false),
});

const StepSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1).max(200).trim(),
  body: z.string().max(4000).trim().optional().default(''),
});

const CodeSampleSchema = z.object({
  filename: z.string().min(1).max(200).trim(),
  language: z.string().max(40).trim().optional().default('text'),
  code: z.string().max(100000).default(''),
});

export const CreateProjectSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  shortDescription: z.string().max(500).trim().optional().default(''),
  description: z.string().max(20000).optional().default(''),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id').optional().nullable(),
  difficulty: DifficultyEnum.optional().nullable(),
  estimatedCost: z.number().min(0).max(10_000_000).optional().nullable(),
  currency: z.string().max(8).optional().default('USD'),
  estimatedBuildTime: z.string().max(100).optional().default(''),
  buildLanguage: z.string().max(64).optional().default(''),
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
  components: z.array(ComponentSchema).optional().default([]),
  steps: z.array(StepSchema).optional().default([]),
  codeSamples: z.array(CodeSampleSchema).optional().default([]),
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
  buildLanguage: z.string().max(64).optional(),
  youtubeUrl: z
    .string()
    .max(500)
    .trim()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || youtubeUrlPattern.test(v),
      'Must be a YouTube URL (youtube.com or youtu.be)'
    ),
  components: z.array(ComponentSchema).optional(),
  steps: z.array(StepSchema).optional(),
  codeSamples: z.array(CodeSampleSchema).optional(),
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
