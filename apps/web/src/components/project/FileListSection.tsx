import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

interface ProjectFile {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  downloadEnabled: boolean;
}

function extBadge(filename: string): string {
  const ext = filename.split('.').pop()?.toUpperCase() ?? 'FILE';
  return ext.length > 4 ? ext.slice(0, 4) : ext;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileListSection({
  files,
  projectId,
  canDownload,
}: {
  files: ProjectFile[];
  projectId: string;
  canDownload: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function download(fileId: string) {
    setBusy(fileId);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      const res = await fetch(
        `${apiUrl}/api/v1/projects/${projectId}/files/${fileId}/download`,
        { credentials: 'include' }
      );
      if (!res.ok) return;
      const body = await res.json();
      if (body.success && body.data.downloadUrl) {
        const a = document.createElement('a');
        a.href = body.data.downloadUrl;
        a.download = body.data.filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setBusy(null);
    }
  }

  if (files.length === 0) {
    return (
      <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
        No files attached to this project yet.
      </p>
    );
  }

  return (
    <div>
      {files.map((f, idx) => (
        <div
          key={f.id}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: idx < files.length - 1 ? '1px solid #E2E8F0' : 0,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {extBadge(f.originalFilename)}
          </span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
            <b
              style={{
                display: 'block',
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {f.originalFilename}
            </b>
            <small style={{ display: 'block', color: '#64748B', fontSize: 12 }}>
              {f.category} · {formatBytes(f.sizeBytes)}
            </small>
          </div>
          {(f.downloadEnabled || canDownload) && (
            <button
              onClick={() => download(f.id)}
              disabled={busy === f.id}
              aria-label={`Download ${f.originalFilename}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: busy === f.id ? 'wait' : 'pointer',
                flexShrink: 0,
              }}
            >
              <Download size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
