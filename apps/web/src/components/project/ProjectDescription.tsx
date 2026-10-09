import { useState } from 'react';

interface Props {
  description: string;
  shortDescription: string;
  difficulty: string | null;
  publishedAt: string | null;
  estimatedBuildTime: string | null;
  views: number;
  category: string | null;
  tags: string[];
}

export function ProjectDescription({
  description,
  shortDescription,
  difficulty,
  publishedAt,
  estimatedBuildTime,
  views,
  category,
  tags,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const fullText = description || shortDescription || '';
  const firstParagraph = fullText.split('\n\n')[0];
  const hasMore = fullText.length > firstParagraph.length;
  const displayText = expanded ? fullText : firstParagraph;

  return (
    <div style={{ marginTop: 24 }}>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: '#334155',
          marginBottom: 12,
          maxWidth: '72ch',
          whiteSpace: 'pre-wrap',
        }}
      >
        {displayText}
      </p>

      {expanded && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(90px, 1fr))',
              margin: '20px 0',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              background: '#fff',
              overflow: 'hidden',
            }}
            className="project-meta-grid"
          >
            <MetaCell label="Difficulty" value={difficulty ?? '—'} />
            <MetaCell
              label="Published"
              value={publishedAt ? new Date(publishedAt).toLocaleDateString() : '—'}
            />
            <MetaCell label="Build time" value={estimatedBuildTime ?? '—'} />
            <MetaCell label="Views" value={views.toLocaleString()} />
            <MetaCell label="Category" value={category ?? '—'} />
          </div>

          {tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 12,
              }}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    padding: '4px 11px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            border: 0,
            background: 'none',
            color: '#2563EB',
            fontWeight: 600,
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRight: '1px solid #E2E8F0',
      }}
    >
      <span
        style={{
          display: 'block',
          color: '#64748B',
          fontSize: 12,
          marginBottom: 3,
        }}
      >
        {label}
      </span>
      <b style={{ fontSize: 14 }}>{value}</b>
    </div>
  );
}
