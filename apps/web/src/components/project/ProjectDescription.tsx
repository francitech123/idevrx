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
    <div style={{ marginTop: 26 }}>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 17,
          lineHeight: 1.7,
          color: 'var(--color-ink-subtle)',
          marginBottom: 14,
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
              margin: '22px 0',
              border: '1px solid var(--color-line)',
              borderRadius: 10,
              background: 'var(--color-card)',
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
                marginBottom: 14,
              }}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--color-card)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-line)',
                    padding: '4px 11px',
                    borderRadius: 999,
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
            color: 'var(--color-accent)',
            fontWeight: 600,
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <style>{`
        @media (max-width: 700px) {
          .project-meta-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .project-meta-grid > div {
            border-bottom: 1px solid var(--color-line);
          }
          .project-meta-grid > div:nth-child(2n) {
            border-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRight: '1px solid var(--color-line)',
      }}
    >
      <span
        style={{
          display: 'block',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-muted)',
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <b
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          fontWeight: 600,
        }}
      >
        {value}
      </b>
    </div>
  );
}
