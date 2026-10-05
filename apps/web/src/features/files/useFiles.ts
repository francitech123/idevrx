import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileApi } from './fileApi';
import { projectKeys } from '@/features/projects/useProjects';

export const fileKeys = {
  list: (projectId: string) => ['files', 'list', projectId] as const,
};

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: fileKeys.list(projectId ?? ''),
    queryFn: () => fileApi.list(projectId!),
    enabled: !!projectId,
    staleTime: 15_000,
  });
}

export function useDeleteFile(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => fileApi.remove(projectId, fileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.list(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useDownloadFile(projectId: string) {
  return useMutation({
    mutationFn: (fileId: string) => fileApi.download(projectId, fileId),
  });
}
