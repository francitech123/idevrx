import { FileCard } from './FileCard';
import { useDeleteFile, useProjectFiles } from '@/features/files/useFiles';

export function FileList({
  projectId,
  canEdit,
}: {
  projectId: string;
  canEdit: boolean;
}) {
  const { data: files, isLoading, isError } = useProjectFiles(projectId);
  const remove = useDeleteFile(projectId);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 130,
              borderRadius: 10,
              background: 'var(--color-paper-muted)',
            }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: 18,
          border: '1px solid var(--color-error)',
          background: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          borderRadius: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
        }}
      >
        Could not load files.
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          padding: 22,
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-muted)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          borderRadius: 8,
        }}
      >
        No files yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
      }}
    >
      {files.map((f) => (
        <FileCard
          key={f.id}
          file={f}
          projectId={projectId}
          canRemove={canEdit}
          onRemove={async () => {
            if (!confirm(`Remove "${f.originalFilename}"?`)) return;
            await remove.mutateAsync(f.id);
          }}
        />
      ))}
    </div>
  );
}
