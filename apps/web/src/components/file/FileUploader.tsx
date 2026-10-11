import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fileApi, uploadToPresignedUrl } from '@/features/files/fileApi';
import { fileKeys } from '@/features/files/useFiles';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

type UploadState =
  | { status: 'idle' }
  | { status: 'preparing'; filename: string }
  | { status: 'uploading'; filename: string; percent: number }
  | { status: 'finalizing'; filename: string }
  | { status: 'done'; filename: string }
  | { status: 'error'; filename: string; message: string };

export function FileUploader({ projectId }: { projectId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const qc = useQueryClient();

  function pick() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setState({
        status: 'error',
        filename: file.name,
        message: 'File exceeds the maximum size of 50 MB.',
      });
      return;
    }
    if (file.size <= 0) {
      setState({ status: 'error', filename: file.name, message: 'File is empty.' });
      return;
    }

    setState({ status: 'preparing', filename: file.name });

    try {
      const intent = await fileApi.createUploadIntent(projectId, {
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });

      setState({ status: 'uploading', filename: file.name, percent: 0 });
      await uploadToPresignedUrl(intent.uploadUrl, file, (percent) => {
        setState({ status: 'uploading', filename: file.name, percent });
      });

      setState({ status: 'finalizing', filename: file.name });
      await fileApi.finalize(projectId, intent.fileId);

      qc.invalidateQueries({ queryKey: fileKeys.list(projectId) });

      setState({ status: 'done', filename: file.name });
      setTimeout(() => setState({ status: 'idle' }), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setState({ status: 'error', filename: file.name, message });
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) handleFile(f);
  }

  const busy =
    state.status === 'preparing' ||
    state.status === 'uploading' ||
    state.status === 'finalizing';

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px dashed var(--color-line-strong)',
        borderRadius: 10,
        padding: 24,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={onChange}
        className="hidden"
        style={{ display: 'none' }}
        disabled={busy}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            marginBottom: 4,
            color: 'var(--color-ink)',
          }}
        >
          Upload a file
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-muted)',
            marginBottom: 18,
          }}
        >
          Images, PDFs, CAD, ZIP archives, code. Max 50 MB per file.
        </p>
        <button
          onClick={pick}
          disabled={busy}
          style={{
            padding: '11px 22px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            border: 0,
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: busy ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {busy ? 'Uploading...' : 'Choose file'}
        </button>
      </div>

      {state.status !== 'idle' && (
        <div
          style={{
            marginTop: 18,
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
          }}
        >
          {state.status === 'preparing' && (
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>
              Preparing upload for {state.filename}...
            </p>
          )}
          {state.status === 'uploading' && (
            <div>
              <p style={{ color: 'var(--color-muted)', marginBottom: 8 }}>
                Uploading {state.filename} — {state.percent}%
              </p>
              <div
                style={{
                  height: 6,
                  width: '100%',
                  background: 'var(--color-paper-muted)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${state.percent}%`,
                    background: 'var(--color-accent)',
                    transition: 'width 0.15s',
                  }}
                />
              </div>
            </div>
          )}
          {state.status === 'finalizing' && (
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>
              Finalizing {state.filename}...
            </p>
          )}
          {state.status === 'done' && (
            <p style={{ color: 'var(--color-success)', margin: 0 }}>
              Uploaded {state.filename}.
            </p>
          )}
          {state.status === 'error' && (
            <p
              style={{ color: 'var(--color-error)', margin: 0 }}
              role="alert"
            >
              {state.filename}: {state.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
