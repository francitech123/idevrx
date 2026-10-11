import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  lessonCount: number;
}

export function LearningPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/learning-paths`)
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setPaths(b.data.paths ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="idx-page" style={{ maxWidth: 1000 }}>
      <div className="idx-eyebrow">Learning</div>
      <h1>Learning paths</h1>

      <p>
        Learning paths connect projects into structured progress. Paths reference
        real IDEVRX projects — they never duplicate project content.
      </p>

      <h2>How it works</h2>
      <p>
        Each path walks through a sequence of topics and projects. You can follow
        a path at your own pace. Progress belongs to your account and tracks
        which lessons you've completed.
      </p>

      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 32,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 160,
                background: 'var(--color-paper-muted)',
                borderRadius: 10,
              }}
            />
          ))}
        </div>
      )}

      {!loading && paths.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            border: '1px dashed var(--color-line-strong)',
            borderRadius: 10,
            background: 'var(--color-card)',
            marginTop: 28,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
              margin: 0,
            }}
          >
            Learning paths are part of a future release.
          </p>
        </div>
      )}

      {!loading && paths.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 32,
          }}
        >
          {paths.map((p) => (
            <Link
              key={p.id}
              to={`/learning-hub`}
              style={{
                display: 'block',
                padding: 20,
                background: 'var(--color-card)',
                border: '1px solid var(--color-line)',
                borderRadius: 10,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: 10,
                }}
              >
                {p.category || 'Path'}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '-0.012em',
                  marginBottom: 8,
                  color: 'var(--color-ink)',
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--color-muted)',
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {p.description}
              </p>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-muted)',
                }}
              >
                {p.lessonCount} lesson{p.lessonCount === 1 ? '' : 's'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
