import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileSizeBadge } from './FileSizeBadge';
import { useDownloadFile } from '@/features/files/useFiles';
import type { ProjectFile } from '@/features/files/fileApi';

const CATEGORY_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  code: 'Code',
  cad: 'CAD',
  document: 'Document',
  schematic: 'Schematic',
  dataset: 'Dataset',
  other: 'File',
};

export function FileCard({
  file,
  projectId,
  onRemove,
  canRemove,
}: {
  file: ProjectFile;
  projectId: string;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const download = useDownloadFile(projectId);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    try {
      const result = await download.mutateAsync(file.id);
      // Trigger browser download
      const a = document.createElement('a');
      a.href = result.downloadUrl;
      a.download = result.filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-brand-primary mb-0.5">
            {CATEGORY_LABELS[file.category] ?? 'File'}
          </p>
          <p className="text-sm font-medium text-text-primary truncate" title={file.originalFilename}>
            {file.originalFilename}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <FileSizeBadge sizeBytes={file.sizeBytes} />
            <span className="text-xs text-text-muted truncate">{file.mimeType}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error mt-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handleDownload}
          loading={download.isPending}
        >
          Download
        </Button>
        {canRemove && onRemove && (
          <Button variant="ghost" size="md" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
