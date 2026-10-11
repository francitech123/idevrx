import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Folder } from 'lucide-react';

interface LibraryProject {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  version: string;
  difficulty: string | null;
  counts: { views: number; likes: number; bookmarks: number; comments: number };
}

type Tab = 'saved' | 'liked' | 'history';

const TABS: { key: Tab; label: string }[] = [
  { key: 'saved', label: 'Saved' },
  { key: 'liked', label: 'Liked' },
  { key: 'history', label: 'History' },
];

export function LibraryPage() {
  const [tab, setTab] = useState<Tab>('saved');
  const [items, setItems] = useState<LibraryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const endpoint =
      tab === 'saved'
        ? '/api/v1/me/saved'
        : tab === 'liked'
        ? '/api/v1/me/liked'
        : '/api/v1/me/history';

    fetch(`${apiUrl}${endpoint}?limit=50`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body && body.success) {
          const list = body.data.items ?? [];
          setItems(list);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            color: 'var(--color-ink)',
          }}
        >
          Library
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 15,
          }}
        >
          Everything you saved, liked, or opened recently.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 24,
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 0',
              border: 0,
              background: 'none',
              borderBottom:
                tab === t.key
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              color:
                tab === t.key ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 300,
                borderRadius: 10,
                background: 'var(--color-paper-muted)',
              }}
            />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed var(--color-line-strong)',
            borderRadius: 10,
            color: 'var(--color-muted)',
            background: 'var(--color-card)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 500,
              marginBottom: 8,
              color: 'var(--color-ink)',
            }}
          >
            Nothing here yet
          </h3>
          <p
            style={{
              marginBottom: 22,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
            }}
          >
            {tab === 'saved'
              ? 'Save any project and it will appear here.'
              : tab === 'liked'
              ? 'Like any project and it will appear here.'
              : 'Projects you open will appear here.'}
          </p>
          <Link
            to="/explore"
            style={{
              display: 'inline-block',
              padding: '11px 22px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              borderRadius: 6,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Browse projects
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {items.map((p) => {
            const url = `/ide/project-${String(p.projectNumber).padStart(3, '0')}/${p.slug}`;
            return (
              <article
                key={p.id}
                onClick={() => navigate(url)}
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    aspectRatio: '3 / 2',
                    background: 'var(--color-paper-muted)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: 'var(--color-ink)',
                      color: 'var(--color-paper)',
                      padding: '4px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {p.version}
                  </span>
                </div>
                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: 8,
                    }}
                  >
                    PROJECT {String(p.projectNumber).padStart(3, '0')}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 21,
                      fontWeight: 500,
                      letterSpacing: '-0.012em',
                      lineHeight: 1.2,
                      marginBottom: 8,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {p.title}
                  </h3>
                  {p.shortDescription && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13.5,
                        color: 'var(--color-muted)',
                        lineHeight: 1.55,
                        marginBottom: 14,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.shortDescription}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      color: 'var(--color-muted)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={13} /> {p.counts.likes}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MessageCircle size={13} /> {p.counts.comments}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Folder size={13} /> {p.counts.bookmarks}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
