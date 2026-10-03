import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, formatBytes } from '@/features/files/constants';
import type { ProjectFile } from '@/features/files/fileApi';

interface FileCardProps {
  file: ProjectFile;
  onDownload?: (file: ProjectFile) => void;
  onDelete?: (file: ProjectFile) => void;
  downloading?: boolean;
  deleting?: boolean;
}

export function FileCard({ file, onDownload, onDelete, downloading, deleting }: FileCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-text-primary truncate" title={file.originalFilename}>
          {file.originalFilename}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {CATEGORY_LABELS[file.category]} · {formatBytes(file.sizeBytes)} · {file.mimeType}
        </p>
        {file.processingStatus !== 'ready' && (
          <p className="text-xs text-warning mt-1">
            Status: {file.processingStatus}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onDownload && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => onDownload(file)}
            loading={downloading}
          >
            Download
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => onDelete(file)}
            loading={deleting}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
