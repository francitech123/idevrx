import { api } from '@/api/client';

export interface CreatorApplication {
  id: string;
  userId: string;
  motivation: string;
  experience: string;
  portfolioUrl: string;
  status: 'pending' | 'approved' | 'denied' | 'withdrawn';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string;
  submittedAt: string;
  createdAt: string;
}

export interface CreatorApplicationForReview extends CreatorApplication {
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  } | null;
}

export interface ApplyCreatorInput {
  motivation: string;
  experience?: string;
  portfolioUrl?: string;
}

export const creatorApi = {
  apply: (input: ApplyCreatorInput) =>
    api.post<{ application: CreatorApplication }>('/api/v1/creator/apply', input),

  getOwn: () =>
    api.get<{ application: CreatorApplication | null }>('/api/v1/creator/application'),

  listForReview: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return api.get<{ applications: CreatorApplicationForReview[] }>(
      `/api/v1/admin/creator-applications${qs}`
    );
  },

  review: (id: string, decision: 'approved' | 'denied', note?: string) =>
    api.post<{ application: CreatorApplication }>(
      `/api/v1/admin/creator-applications/${id}/review`,
      { decision, note: note ?? '' }
    ),
};
