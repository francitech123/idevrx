import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fileApi, uploadToPresignedUrl } from '@/features/files/fileApi';
import { useQueryClient } from '@tanstack/react-query';
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
        message: `File exceeds the maximum size of 50 MB.`,
      });
      return;
    }
    if (file.size <= 0) {
      setState({ status: 'error', filename: file.name, message: 'File is empty.' });
      return;
    }

    setState({ status: 'preparing', filename: file.name });

    try {
      // 1. Ask server for upload intent
      const intent = await fileApi.createUploadIntent(projectId, {
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });

      // 2. Upload directly to Supabase Storage
      setState({ status: 'uploading', filename: file.name, percent: 0 });
      await uploadToPresignedUrl(intent.uploadUrl, file, (percent) => {
        setState({ status: 'uploading', filename: file.name, percent });
      });

      // 3. Tell server to finalize
      setState({ status: 'finalizing', filename: file.name });
      await fileApi.finalize(projectId, intent.fileId);

      // 4. Refresh file list
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
    <div className="rounded-card border border-dashed border-border bg-surface p-5">
      <input
        ref={inputRef}
        type="file"
        onChange={onChange}
        className="hidden"
        disabled={busy}
      />

      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-medium mb-1">Upload a file</p>
        <p className="text-xs text-text-muted mb-4">
          Images, PDFs, CAD, ZIP archives, code. Max 50 MB per file.
        </p>
        <Button onClick={pick} disabled={busy} loading={busy}>
          {busy ? 'Uploading...' : 'Choose file'}
        </Button>
      </div>

      {state.status !== 'idle' && (
        <div className="mt-4 text-sm">
          {state.status === 'preparing' && (
            <p className="text-text-secondary">Preparing upload for {state.filename}...</p>
          )}
          {state.status === 'uploading' && (
            <div>
              <p className="text-text-secondary mb-2">
                Uploading {state.filename} — {state.percent}%
              </p>
              <div className="h-1.5 w-full bg-muted rounded-pill overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all"
                  style={{ width: `${state.percent}%` }}
                />
              </div>
            </div>
          )}
          {state.status === 'finalizing' && (
            <p className="text-text-secondary">Finalizing {state.filename}...</p>
          )}
          {state.status === 'done' && (
            <p className="text-success">Uploaded {state.filename}.</p>
          )}
          {state.status === 'error' && (
            <p className="text-error" role="alert">
              {state.filename}: {state.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
