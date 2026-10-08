import { z } from 'zod';

export const CreateCommentSchema = z.object({
  body: z.string().min(1).max(4000).trim(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
});

export const UpdateCommentSchema = z.object({
  body: z.string().min(1).max(4000).trim(),
});

export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const FeedQuerySchema = z.object({
  following: z.enum(['true', 'false']).optional().default('false'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(30).optional().default(12),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).trim().optional(),
  bio: z.string().max(500).trim().optional(),
});

export const UpdatePreferencesSchema = z.object({
  notifications: z
    .object({
      newUploads: z.boolean().optional(),
      comments: z.boolean().optional(),
      replies: z.boolean().optional(),
      likes: z.boolean().optional(),
      follows: z.boolean().optional(),
      learning: z.boolean().optional(),
      emailDigest: z.boolean().optional(),
    })
    .optional(),
  playback: z
    .object({
      autoplay: z.boolean().optional(),
      captions: z.boolean().optional(),
      dataSaver: z.boolean().optional(),
      quality: z.enum(['Auto', '1080p', '720p', '480p', '360p']).optional(),
      speed: z.enum(['0.5x', '1x', '1.25x', '1.5x', '2x']).optional(),
    })
    .optional(),
  privacy: z
    .object({
      publicProfile: z.boolean().optional(),
      showLikes: z.boolean().optional(),
      showHistory: z.boolean().optional(),
      allowComments: z.boolean().optional(),
      personalisedRecommendations: z.boolean().optional(),
    })
    .optional(),
  appearance: z
    .object({
      theme: z.enum(['System', 'Light', 'Dark']).optional(),
      language: z.enum(['English', 'French', 'Yoruba', 'Hausa', 'Igbo']).optional(),
    })
    .optional(),
});
