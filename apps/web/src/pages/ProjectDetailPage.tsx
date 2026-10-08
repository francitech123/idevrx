import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Download,
  FileText,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  UserPlus,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useAuth';
import { useCategories } from '@/features/projects/useProjects';

interface Author {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

interface FileItem {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  downloadEnabled: boolean;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string } | null;
}

interface ProjectData {
  id: string;
  projectNumber: number;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  authorId: string;
  categoryId: string | null;
  tagIds: string[];
  status: string;
  visibility: string;
  difficulty: string | null;
  estimatedCost: number | null;
  currency: string;
  estimatedBuildTime: string | null;
  version: string;
  youtubeUrl: string | null;
  coverFileId: string | null;
  featured: boolean;
  counts: { views: number; likes: number; bookmarks: number; comments: number };
  publishedAt: string | null;
  createdAt: string;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (u.searchParams.get('v')) id = u.searchParams.get('v')!;
    else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export function ProjectDetailPage() {
  const { projectNumber, slug } = useParams<{ projectNumber: string; slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data: categoriesData } = useCategories();

  const numeric = projectNumber?.replace(/^project-/, '') ?? '';
  const idOrNumber = /^\d+$/.test(numeric) ? numeric : slug ?? '';

  const [project, setProject] = useState<ProjectData | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  const [commentBody, setCommentBody] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    if (!idOrNumber) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/v1/projects/${encodeURIComponent(idOrNumber)}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then(async (body) => {
        if (!body.success) throw new Error(body.error?.message ?? 'Not found');
        const p: ProjectData = body.data.project;
        setProject(p);
        setLikesCount(p.counts.likes);
        setBookmarksCount(p.counts.bookmarks);

        const [authorRes, filesRes, commentsRes, relRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/profiles/${p.authorId}`, { credentials: 'include' }).catch(
            () => null
          ),
          fetch(`${apiUrl}/api/v1/projects/${p.id}/files`, { credentials: 'include' }).catch(
            () => null
          ),
          fetch(`${apiUrl}/api/v1/projects/${p.id}/comments`, { credentials: 'include' }).catch(
            () => null
          ),
          fetch(
            `${apiUrl}/api/v1/projects?categoryId=${p.categoryId ?? ''}&limit=4`,
            { credentials: 'include' }
          ).catch(() => null),
        ]);

        if (authorRes && authorRes.ok) {
          const b = await authorRes.json();
          if (b.success) setAuthor(b.data.profile);
        }

        if (filesRes && filesRes.ok) {
          const b = await filesRes.json();
          if (b.success) setFiles(b.data.files ?? []);
        }

        if (commentsRes && commentsRes.ok) {
          const b = await commentsRes.json();
          if (b.success) setComments(b.data.comments ?? []);
        }

        if (relRes && relRes.ok) {
          const b = await relRes.json();
          if (b.success) {
            setRelated(
              (b.data.projects ?? []).filter((x: ProjectData) => x.id !== p.id).slice(0, 3)
            );
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idOrNumber]);

  useEffect(() => {
    if (!user || !project) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';

    fetch(`${apiUrl}/api/v1/projects/${project.id}/like`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) {
          setLiked(b.data.liked);
          setLikesCount(b.data.count);
        }
      })
      .catch(() => {});

    fetch(`${apiUrl}/api/v1/projects/${project.id}/bookmark`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) {
          setSaved(b.data.saved);
          setBookmarksCount(b.data.count);
        }
      })
      .catch(() => {});

    if (project.authorId !== user.id) {
      fetch(`${apiUrl}/api/v1/users/${project.authorId}/follow`, {
        credentials: 'include',
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => {
          if (b?.success) {
            setFollowing(b.data.following);
            setFollowers(b.data.followers ?? 0);
          }
        })
        .catch(() => {});
    }

    fetch(`${apiUrl}/api/v1/projects/${project.id}/view`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, [user, project]);

  if (authLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            height: 400,
            background: '#E2E8F0',
            borderRadius: 18,
            marginBottom: 20,
          }}
        />
        <div
          style={{ height: 40, width: 300, background: '#E2E8F0', borderRadius: 8 }}
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 64, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#64748B',
            marginBottom: 12,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Project not found
        </h1>
        <p style={{ color: '#64748B', marginBottom: 24 }}>
          {error ?? "This project doesn't exist or isn't publicly visible."}
        </p>
        <Link
          to="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = user.id === project.authorId;
  const category = categoriesData?.find((c) => c.id === project.categoryId);
  const formattedNumber = `PROJECT ${String(project.projectNumber).padStart(3, '0')}`;
  const publicUrl = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;
  const embedUrl = project.youtubeUrl ? youtubeEmbed(project.youtubeUrl) : null;

  async function toggleLike() {
    if (!project) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const method = liked ? 'DELETE' : 'POST';
    const res = await fetch(`${apiUrl}/api/v1/projects/${project.id}/like`, {
      method,
      credentials: 'include',
    });
    if (res.ok) {
      const b = await res.json();
      setLiked(b.data.liked);
      setLikesCount(b.data.count);
    }
  }

  async function toggleBookmark() {
    if (!project) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const method = saved ? 'DELETE' : 'POST';
    const res = await fetch(`${apiUrl}/api/v1/projects/${project.id}/bookmark`, {
      method,
      credentials: 'include',
    });
    if (res.ok) {
      const b = await res.json();
      setSaved(b.data.saved);
      setBookmarksCount(b.data.count);
    }
  }

  async function toggleFollow() {
    if (!project) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const method = following ? 'DELETE' : 'POST';
    const res = await fetch(`${apiUrl}/api/v1/users/${project.authorId}/follow`, {
      method,
      credentials: 'include',
    });
    if (res.ok) {
      const b = await res.json();
      setFollowing(b.data.following);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      navigator.share({ title: project?.title, url: window.location.href }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {}
    }
  }

  async function postComment() {
    if (!project || !commentBody.trim()) return;
    setCommentBusy(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/projects/${project.id}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentBody.trim() }),
      });
      if (res.ok) {
        const b = await res.json();
        if (b.success) {
          setComments((prev) => [b.data.comment, ...prev]);
          setCommentBody('');
        }
      }
    } finally {
      setCommentBusy(false);
    }
  }

  async function downloadFile(fileId: string) {
    if (!project) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const res = await fetch(
      `${apiUrl}/api/v1/projects/${project.id}/files/${fileId}/download`,
      { credentials: 'include' }
    );
    if (res.ok) {
      const b = await res.json();
      if (b.success && b.data.downloadUrl) {
        const a = document.createElement('a');
        a.href = b.data.downloadUrl;
        a.download = b.data.filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/home')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          border: '1px solid #E2E8F0',
          background: '#fff',
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 340px)',
          gap: 28,
        }}
        className="project-detail-grid"
      >
        <div>
          <div
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #0A1225 0%, #1E293B 100%)',
              borderRadius: 18,
              overflow: 'hidden',
              marginBottom: 20,
              color: '#fff',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '5px 12px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              {category?.name ?? 'Project'}
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '5px 10px',
                borderRadius: 6,
                backdropFilter: 'blur(8px)',
              }}
            >
              {project.version}
            </span>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#2563EB',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {formattedNumber}
          </p>
          <h1
            style={{
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {project.title}
          </h1>
          {project.shortDescription && (
            <p
              style={{
                fontSize: 17,
                color: '#475569',
                lineHeight: 1.55,
                marginBottom: 20,
                maxWidth: '70ch',
              }}
            >
              {project.shortDescription}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <button
              onClick={toggleLike}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                border: `1px solid ${liked ? '#2563EB' : '#E2E8F0'}`,
                background: liked ? '#EFF6FF' : '#fff',
                color: liked ? '#2563EB' : '#0F172A',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {likesCount}
            </button>
            <button
              onClick={toggleBookmark}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                border: `1px solid ${saved ? '#2563EB' : '#E2E8F0'}`,
                background: saved ? '#EFF6FF' : '#fff',
                color: saved ? '#2563EB' : '#0F172A',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
              {bookmarksCount}
            </button>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                border: '1px solid #E2E8F0',
                background: '#fff',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {author && project.authorId !== user.id && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {author.displayName
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{author.displayName}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  @{author.username} · {followers} followers
                </div>
              </div>
              <button
                onClick={toggleFollow}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  border: `1px solid ${following ? '#E2E8F0' : '#2563EB'}`,
                  background: following ? '#fff' : '#2563EB',
                  color: following ? '#0F172A' : '#fff',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
          )}

          {embedUrl && (
            <div
              style={{
                aspectRatio: '16/9',
                borderRadius: 14,
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              <iframe
                src={embedUrl}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>
          )}

          {project.description && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
                Description
              </h2>
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {project.description}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
                Files
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                    }}
                  >
                    <FileText size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.originalFilename}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {f.category} · {formatBytes(f.sizeBytes)}
                      </div>
                    </div>
                    {(f.downloadEnabled || isOwner) && (
                      <button
                        onClick={() => downloadFile(f.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          border: '1px solid #E2E8F0',
                          background: '#fff',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Download size={13} /> Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MessageCircle size={18} /> Comments ({comments.length})
            </h2>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    postComment();
                  }
                }}
                style={{
                  flex: 1,
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: 14,
                }}
              />
              <button
                onClick={postComment}
                disabled={commentBusy || !commentBody.trim()}
                style={{
                  padding: '10px 18px',
                  background: '#2563EB',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: commentBusy ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: !commentBody.trim() ? 0.5 : 1,
                }}
              >
                Post
              </button>
            </div>

            {comments.length === 0 && (
              <p style={{ color: '#64748B', fontSize: 13 }}>
                No comments yet. Be the first.
              </p>
            )}

            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  {c.author?.displayName ?? 'Unknown'}
                </div>
                <div style={{ fontSize: 14, color: '#334155', marginBottom: 4 }}>
                  {c.body}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  {timeAgo(c.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              position: 'sticky',
              top: 88,
            }}
          >
            <h3
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748B',
                marginBottom: 14,
              }}
            >
              Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MetaRow
                icon={<Award size={14} />}
                label="Status"
                value={project.status}
              />
              <MetaRow
                icon={<Tag size={14} />}
                label="Version"
                value={project.version}
              />
              {category && (
                <MetaRow
                  icon={<Tag size={14} />}
                  label="Category"
                  value={category.name}
                />
              )}
              {project.difficulty && (
                <MetaRow
                  icon={<Award size={14} />}
                  label="Difficulty"
                  value={project.difficulty}
                />
              )}
              {project.estimatedBuildTime && (
                <MetaRow
                  icon={<Clock size={14} />}
                  label="Build time"
                  value={project.estimatedBuildTime}
                />
              )}
              {project.estimatedCost != null && (
                <MetaRow
                  icon={<DollarSign size={14} />}
                  label="Estimated cost"
                  value={`${project.currency} ${project.estimatedCost}`}
                />
              )}
              {project.publishedAt && (
                <MetaRow
                  icon={<Calendar size={14} />}
                  label="Published"
                  value={new Date(project.publishedAt).toLocaleDateString()}
                />
              )}
            </div>

            {isOwner && (
              <Link
                to={`/studio/project/${project.id}`}
                style={{
                  display: 'block',
                  marginTop: 20,
                  padding: '11px 18px',
                  background: '#2563EB',
                  color: '#fff',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Edit project
              </Link>
            )}
          </div>

          {related.length > 0 && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                More like this
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/ide/project-${String(r.projectNumber).padStart(3, '0')}/${r.slug}`}
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: '#0F172A',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: '#2563EB',
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      PROJECT {String(r.projectNumber).padStart(3, '0')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 20,
              padding: '9px 16px',
              border: '1px solid #E2E8F0',
              background: '#fff',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .project-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#64748B',
        }}
      >
        {icon}
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          color: '#0F172A',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
        }}
      >
        {value}
      </span>
    </div>
  );
}
