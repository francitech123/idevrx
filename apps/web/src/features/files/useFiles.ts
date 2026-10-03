import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileApi, type FileCategory, type ProjectFile } from './fileApi';

export const fileKeys = {
  all: ['files'] as const,
  byProject: (projectRef: string) => [...fileKeys.all, 'project', projectRef] as const,
};

export function useProjectFiles(projectRef: string | undefined) {
  return useQuery({
    queryKey: fileKeys.byProject(projectRef ?? ''),
    queryFn: () => fileApi.list(projectRef!),
    enabled: !!projectRef,
    staleTime: 15_000,
  });
}

export function useUploadFile(projectRef: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      category,
      onProgress,
    }: {
      file: File;
      category: FileCategory;
      onProgress?: (percent: number) => void;
    }) => fileApi.uploadFile(projectRef, file, category, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.byProject(projectRef) });
    },
  });
}

export function useDeleteFile(projectRef: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => fileApi.remove(projectRef, fileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.byProject(projectRef) });
    },
  });
}

export function useDownloadFile(projectRef: string) {
  return useMutation({
    mutationFn: async (file: ProjectFile) => {
      const { url, filename } = await fileApi.getDownloadUrl(projectRef, file.id);
      // Trigger a browser download via a temporary anchor
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  });
}
