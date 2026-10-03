import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creatorApi, type ApplyCreatorInput } from './creatorApi';
import { useCurrentUser } from '@/features/auth/useAuth';

const KEYS = {
  own: ['creator', 'own'] as const,
  reviewList: (status?: string) => ['creator', 'review', status ?? 'all'] as const,
};

export function useOwnApplication(enabled: boolean) {
  return useQuery({
    queryKey: KEYS.own,
    queryFn: creatorApi.getOwn,
    enabled,
    staleTime: 30_000,
  });
}

export function useApplyForCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplyCreatorInput) => creatorApi.apply(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.own });
    },
  });
}

export function useReviewList(status?: string) {
  const { user } = useCurrentUser();
  const canReview =
    !!user &&
    (user.roles.includes('moderator') ||
      user.roles.includes('admin') ||
      user.roles.includes('ceo'));

  return useQuery({
    queryKey: KEYS.reviewList(status),
    queryFn: () => creatorApi.listForReview(status),
    enabled: canReview,
    staleTime: 15_000,
  });
}

export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: 'approved' | 'denied';
      note?: string;
    }) => creatorApi.review(id, decision, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['creator', 'review'] });
    },
  });
}
