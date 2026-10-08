import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Folder } from 'lucide-react';

interface FeedProject {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: string | null;
  estimatedBuildTime: string | null;
  version: string;
  counts: { views: number; likes: number; bookmarks: number; comments: number };
  authorId: string;
  publishedAt: string | null;
}

export function FollowingPage() {
  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/feed?following=true&limit=30`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body && body.success) setProjects(body.data.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          Following
        </h1>
        <p style={{ color: '#64748B', fontSize: 14 }}>
          New builds from creators you follow.
        </p>
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
                borderRadius: 16,
                background: '#E2E8F0',
              }}
            />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed #CBD5E1',
            borderRadius: 16,
            color: '#64748B',
          }}
        >
          <h3 style={{ marginBottom: 8, color: '#0F172A' }}>
            You're not following anyone yet
          </h3>
          <p style={{ marginBottom: 20 }}>
            Follow creators and their latest work will appear here.
          </p>
          <Link
            to="/home"
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
            Find creators
          </Link>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {projects.map((p) => {
            const url = `/ide/project-${String(p.projectNumber).padStart(3, '0')}/${p.slug}`;
            return (
              <article
                key={p.id}
                onClick={() => navigate(url)}
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, #0A1225 0%, #1E293B 100%)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      background: 'rgba(15,23,42,0.85)',
                      color: '#fff',
                      padding: '5px 9px',
                      borderRadius: 6,
                    }}
                  >
                    {p.version}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      color: '#2563EB',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    PROJECT {String(p.projectNumber).padStart(3, '0')}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                    {p.title}
                  </h3>
                  {p.shortDescription && (
                    <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                      {p.shortDescription}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      fontSize: 12,
                      color: '#64748B',
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
