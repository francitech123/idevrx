import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, CATEGORY_LIMITS_MB, CATEGORY_ACCEPT, formatBytes } from '@/features/files/constants';
import type { FileCategory } from '@/features/files/fileApi';
import { useUploadFile } from '@/features/files/useFiles';

interface FileUploaderProps {
  projectRef: string;
}

export function FileUploader({ projectRef }: FileUploaderProps) {
  const [category, setCategory] = useState<FileCategory>('image');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile(projectRef);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);
    setUploadingName(file.name);

    const maxBytes = CATEGORY_LIMITS_MB[category] * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File is ${formatBytes(file.size)} — exceeds ${CATEGORY_LIMITS_MB[category]} MB limit for ${CATEGORY_LABELS[category]}.`);
      setUploadingName(null);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    try {
      await uploadFile.mutateAsync({
        file,
        category,
        onProgress: setProgress,
      });
      setProgress(null);
      setUploadingName(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setUploadingName(null);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <h3 className="font-semibold text-text-primary mb-3">Upload a file</h3>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label htmlFor="file-category" className="block text-sm text-text-secondary mb-1">
            Category
          </label>
          <select
            id="file-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FileCategory)}
            disabled={uploadFile.isPending}
            className="h-10 rounded-input border border-border bg-surface px-3 text-sm"
          >
            {(Object.keys(CATEGORY_LABELS) as FileCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]} (max {CATEGORY_LIMITS_MB[c]} MB)
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            ref={inputRef}
            id="file-input"
            type="file"
            accept={CATEGORY_ACCEPT[category]}
            onChange={handleFileChange}
            disabled={uploadFile.isPending}
            className="hidden"
          />
          <Button
            type="button"
            size="md"
            onClick={() => inputRef.current?.click()}
            loading={uploadFile.isPending}
          >
            Choose file
          </Button>
        </div>

        <p className="text-xs text-text-muted">
          Uploads go directly to storage. Recommended max: {CATEGORY_LIMITS_MB[category]} MB.
        </p>
      </div>

      {uploadingName && progress !== null && (
        <div className="mt-2">
          <p className="text-xs text-text-secondary mb-1">
            Uploading <span className="font-mono">{uploadingName}</span> — {progress}%
          </p>
          <div className="h-1.5 w-full bg-muted rounded-pill overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-button border border-error bg-error/5 px-3 py-2 text-sm text-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
