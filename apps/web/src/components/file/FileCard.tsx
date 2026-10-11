import { useState } from 'react';
import { fileApi } from '@/features/files/fileApi';
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

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    setDownloading(true);
    try {
      const result = await fileApi.download(projectId, file.id);
      const a = document.createElement('a');
      a.href = result.downloadUrl;
      a.download = result.filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 4,
          }}
        >
          {CATEGORY_LABELS[file.category] ?? 'File'}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 4,
          }}
          title={file.originalFilename}
        >
          {file.originalFilename}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
          }}
        >
          <span>{formatBytes(file.sizeBytes)}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {file.mimeType}
          </span>
        </div>
      </div>

      {error && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-error)',
            marginTop: 10,
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--color-line-strong)',
            background: 'var(--color-card)',
            color: 'var(--color-ink)',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: downloading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {downloading ? 'Preparing...' : 'Download'}
        </button>
        {canRemove && onRemove && (
          <button
            onClick={onRemove}
            style={{
              padding: '8px 16px',
              border: 0,
              background: 'transparent',
              color: 'var(--color-muted)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
