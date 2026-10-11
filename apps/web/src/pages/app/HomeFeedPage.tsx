import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, MessageCircle, Folder, Play, RefreshCw } from 'lucide-react';

interface FeedProject {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  coverFileId: string | null;
  youtubeUrl: string | null;
  difficulty: string | null;
  estimatedBuildTime: string | null;
  version: string;
  counts: { views: number; likes: number; bookmarks: number; comments: number };
  publishedAt: string | null;
  authorId: string;
  categoryId: string | null;
}

const CHIPS = ['All', 'Robotics', 'Electronics', 'Embedded', 'Fabrication'];

export function HomeFeedPage() {
  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chip, setChip] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(
    async (nextPage: number, reset: boolean) => {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL ?? '';
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '12',
      });

      try {
        const res = await fetch(`${apiUrl}/api/v1/feed?${params.toString()}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load feed (${res.status})`);
        const body = await res.json();
        if (!body.success) throw new Error(body.error?.message ?? 'Failed');

        const items: FeedProject[] = body.data.items ?? [];
        const filtered =
          chip === 'All'
            ? items
            : items.filter((p) => {
                const wanted = chip.toLowerCase();
                const cat = (p.categoryId ?? '').toString();
                return cat.toLowerCase().includes(wanted) || true;
              });

        setProjects(reset ? filtered : (prev) => [...prev, ...filtered]);
        setHasNext(!!body.meta?.hasNextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    },
    [chip]
  );

  useEffect(() => {
    setPage(1);
    load(1, true);
  }, [chip, load]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next, false);
  }

  const filtered = searchQuery.trim()
    ? projects.filter((p) =>
        (p.title + ' ' + p.shortDescription)
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : projects;

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
          {searchQuery ? `Results for "${searchQuery}"` : 'Latest builds'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 15,
          }}
        >
          Engineering records and builds from across the community.
        </p>
      </div>

      <input
        type="text"
        placeholder="Filter the feed..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 480,
          height: 42,
          padding: '0 16px',
          borderRadius: 6,
          border: '1px solid var(--color-line)',
          background: 'var(--color-card)',
          fontSize: 14,
          marginBottom: 18,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-ink)',
          outline: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 22,
        }}
      >
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              border:
                chip === c
                  ? '1px solid var(--color-ink)'
                  : '1px solid var(--color-line)',
              background:
                chip === c ? 'var(--color-ink)' : 'var(--color-card)',
              color:
                chip === c ? 'var(--color-paper)' : 'var(--color-ink)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && projects.length === 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

      {error && !loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            border: '1px solid var(--color-error)',
            background: 'var(--color-error-bg)',
            borderRadius: 10,
          }}
        >
          <p
            style={{
              color: 'var(--color-error)',
              marginBottom: 14,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {error}
          </p>
          <button
            onClick={() => load(1, true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              border: '1px solid var(--color-line)',
              background: 'var(--color-card)',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              color: 'var(--color-ink)',
            }}
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
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
            No projects yet
          </h3>
          <p
            style={{
              marginBottom: 22,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
            }}
          >
            Be the first to document an engineering project on IDEVRX.
          </p>
          <Link
            to="/studio/new"
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
            Create a project
          </Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((p) => (
            <FeedCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {hasNext && !loading && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={loadMore}
            style={{
              padding: '11px 24px',
              border: '1px solid var(--color-line-strong)',
              background: 'var(--color-card)',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-ink)',
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function FeedCard({ project }: { project: FeedProject }) {
  const navigate = useNavigate();
  const url = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;

  return (
    <article
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => navigate(url)}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 2',
          background: 'var(--color-paper-muted)',
          overflow: 'hidden',
        }}
      >
        {project.youtubeUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--color-paper)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--color-ink)',
              }}
            >
              <Play size={22} fill="currentColor" />
            </span>
          </div>
        )}
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
          {project.version}
        </span>
      </div>

      <div
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: 'var(--color-accent)',
              fontWeight: 600,
            }}
          >
            PROJECT {String(project.projectNumber).padStart(3, '0')}
          </span>
          {project.difficulty && (
            <>
              <span>·</span>
              <span>{project.difficulty.toUpperCase()}</span>
            </>
          )}
          {project.estimatedBuildTime && (
            <>
              <span>·</span>
              <span>EST. {project.estimatedBuildTime.toUpperCase()}</span>
            </>
          )}
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            lineHeight: 1.2,
            color: 'var(--color-ink)',
          }}
        >
          {project.title}
        </h3>

        {project.shortDescription && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-muted)',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.shortDescription}
          </p>
        )}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid var(--color-line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Heart size={13} /> {project.counts.likes}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={13} /> {project.counts.comments}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Folder size={13} /> {project.counts.bookmarks}
            </span>
          </div>
          <Bookmark size={14} />
        </div>
      </div>
    </article>
  );
}
