import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, MessageCircle, Folder, Play, RefreshCw } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useAuth';

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
  const { user } = useCurrentUser();
  const navigate = useNavigate();
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
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          {searchQuery ? `Results for "${searchQuery}"` : 'Latest builds'}
        </h1>
        <p style={{ color: '#64748B', fontSize: 14 }}>
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
          height: 40,
          padding: '0 14px',
          borderRadius: 10,
          border: '1px solid #E2E8F0',
          background: '#fff',
          fontSize: 13,
          marginBottom: 16,
          fontFamily: 'inherit',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 20,
        }}
      >
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            style={{
              padding: '7px 15px',
              borderRadius: 99,
              border: '1px solid #E2E8F0',
              background: chip === c ? '#0F172A' : '#fff',
              color: chip === c ? '#fff' : '#0F172A',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
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
                borderRadius: 16,
                background: '#E2E8F0',
                animation: 'pulse 1.5s ease-in-out infinite',
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
            border: '1px solid #FCA5A5',
            background: '#FEF2F2',
            borderRadius: 16,
          }}
        >
          <p style={{ color: '#B91C1C', marginBottom: 12 }}>{error}</p>
          <button
            onClick={() => load(1, true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              border: '1px solid #E2E8F0',
              background: '#fff',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
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
            border: '1px dashed #CBD5E1',
            borderRadius: 16,
            color: '#64748B',
          }}
        >
          <h3 style={{ marginBottom: 8, color: '#0F172A' }}>No projects yet</h3>
          <p style={{ marginBottom: 20 }}>
            Be the first to document an engineering project on IDEVRX.
          </p>
          <Link
            to="/studio/new"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background:
                'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
              color: '#fff',
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: 'none',
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
              border: '1px solid #E2E8F0',
              background: '#fff',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'inherit',
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
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
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
          aspectRatio: '16/10',
          background: 'linear-gradient(135deg, #0A1225 0%, #1E293B 100%)',
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
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                color: '#0F172A',
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
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#fff',
            padding: '5px 9px',
            borderRadius: 6,
            backdropFilter: 'blur(8px)',
          }}
        >
          {project.version}
        </span>
      </div>

      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#64748B',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#2563EB', fontWeight: 600 }}>
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
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}
        >
          {project.title}
        </h3>

        {project.shortDescription && (
          <p
            style={{
              fontSize: 13,
              color: '#475569',
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
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#64748B',
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
