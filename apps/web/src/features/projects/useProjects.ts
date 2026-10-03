import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  projectApi,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectStatus,
} from './projectApi';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: Record<string, unknown>) => [...projectKeys.all, 'list', params] as const,
  detail: (idOrNumber: string) => [...projectKeys.all, 'detail', idOrNumber] as const,
  mine: (params: Record<string, unknown>) => [...projectKeys.all, 'mine', params] as const,
  categories: ['categories'] as const,
};

export function usePublicProjects(params: { page?: number; limit?: number; categoryId?: string } = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectApi.list(params),
    staleTime: 30_000,
  });
}

export function useProject(idOrNumber: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(idOrNumber ?? ''),
    queryFn: () => projectApi.get(idOrNumber!),
    enabled: !!idOrNumber,
  });
}

export function useMyProjects(params: { page?: number; limit?: number; status?: ProjectStatus } = {}) {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: projectKeys.mine(params),
    queryFn: () => projectApi.listMine(params),
    enabled: isCreator(user),
    staleTime: 15_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: projectKeys.categories,
    queryFn: () => projectApi.listCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProjectInput }) =>
      projectApi.update(id, patch),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function usePublishProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.publish(id),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUnpublishProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.unpublish(id),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
