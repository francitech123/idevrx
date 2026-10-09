import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useAuth';
import { useCategories } from '@/features/projects/useProjects';
import { ProjectVideoPlayer } from '@/components/project/ProjectVideoPlayer';
import { CodeDialog } from '@/components/project/CodeDialog';
import { ProjectDescription } from '@/components/project/ProjectDescription';
import { ProjectAccordion } from '@/components/project/ProjectAccordion';
import { ComponentTable } from '@/components/project/ComponentTable';
import { StepList } from '@/components/project/StepList';
import { FileListSection } from '@/components/project/FileListSection';
import { RelatedProjects } from '@/components/project/RelatedProjects';
import { CommentSection } from '@/components/project/CommentSection';

interface Author {
  id: string;
  username: string;
  displayName: string;
  bio: string;
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
  counts: { views: number; likes: number; bookmarks: number; comments: number };
  publishedAt: string | null;
}

interface Component {
  id: string;
  name: string;
  quantity: string;
  specification: string;
  notes: string;
  optional: boolean;
  sourceUrl: string;
}

interface Step {
  id: string;
  stepNumber: number;
  title: string;
  body: string;
  mediaFileIds: string[];
  warnings: string[];
}

interface CodeSample {
  id: string;
  filename: string;
  language: string;
  code: string;
  description: string;
}

interface ProjectFile {
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
  const [components, setComponents] = useState<Component[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [codeSamples, setCodeSamples] = useState<CodeSample[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
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
  const [openCode, setOpenCode] = useState<CodeSample | null>(null);

  useEffect(() => {
    if (!idOrNumber) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    setLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/v1/projects/${encodeURIComponent(idOrNumber)}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Project not found'))))
      .then(async (body) => {
        if (!body.success) throw new Error(body.error?.message ?? 'Not found');
        const p: ProjectData = body.data.project;
        setProject(p);
        setLikesCount(p.counts.likes);
        setBookmarksCount(p.counts.bookmarks);

        const [authorRes, filesRes, commentsRes, compRes, stepsRes, codeRes, relRes] =
          await Promise.all([
            fetch(`${apiUrl}/api/v1/profiles/${p.authorId}`, { credentials: 'include' }).catch(
              () => null
            ),
            fetch(`${apiUrl}/api/v1/projects/${p.id}/files`, {
              credentials: 'include',
            }).catch(() => null),
            fetch(`${apiUrl}/api/v1/projects/${p.id}/comments`, {
              credentials: 'include',
            }).catch(() => null),
            fetch(`${apiUrl}/api/v1/projects/${p.id}/components`, {
              credentials: 'include',
            }).catch(() => null),
            fetch(`${apiUrl}/api/v1/projects/${p.id}/steps`, {
              credentials: 'include',
            }).catch(() => null),
            fetch(`${apiUrl}/api/v1/projects/${p.id}/code`, {
              credentials: 'include',
            }).catch(() => null),
            fetch(
              `${apiUrl}/api/v1/projects?categoryId=${p.categoryId ?? ''}&limit=4`,
              { credentials: 'include' }
            ).catch(() => null),
          ]);

        if (authorRes?.ok) {
          const b = await authorRes.json();
          if (b.success) setAuthor(b.data.profile);
        }
        if (filesRes?.ok) {
          const b = await filesRes.json();
          if (b.success) setFiles(b.data.files ?? []);
        }
        if (commentsRes?.ok) {
          const b = await commentsRes.json();
          if (b.success) setComments(b.data.comments ?? []);
        }
        if (compRes?.ok) {
          const b = await compRes.json();
          if (b.success) setComponents(b.data.components ?? []);
        }
        if (stepsRes?.ok) {
          const b = await stepsRes.json();
          if (b.success) setSteps(b.data.steps ?? []);
        }
        if (codeRes?.ok) {
          const b = await codeRes.json();
          if (b.success) setCodeSamples(b.data.samples ?? []);
        }
        if (relRes?.ok) {
          const b = await relRes.json();
          if (b.success) {
            setRelated(
              (b.data.projects ?? [])
                .filter((x: ProjectData) => x.id !== p.id)
                .slice(0, 3)
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

  async function share() {
    if (navigator.share) {
      navigator.share({ title: project?.title, url: window.location.href }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {}
    }
  }

  if (authLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            aspectRatio: '16/9',
            background: '#E2E8F0',
            borderRadius: 20,
            marginBottom: 20,
          }}
        />
        <div style={{ height: 40, width: 300, background: '#E2E8F0', borderRadius: 8 }} />
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
            display: 'inline-block',
            padding: '10px 20px',
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = user.id === project.authorId;
  const category = categoriesData?.find((c) => c.id === project.categoryId);
  const formattedNumber = `PROJECT ${String(project.projectNumber).padStart(3, '0')}`;
  const categorySlug = category?.slug ?? 'all';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          color: '#64748B',
          fontSize: 13,
          marginBottom: 18,
        }}
      >
        <Link to="/home" style={{ color: 'inherit', textDecoration: 'none' }}>
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/explore?category=${categorySlug}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {category?.name ?? 'Projects'}
        </Link>
        <span>/</span>
        <b style={{ color: '#0F172A', fontWeight: 500 }}>{formattedNumber}</b>
      </div>

      <ProjectVideoPlayer
        youtubeUrl={project.youtubeUrl}
        projectNumber={project.projectNumber}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) clamp(280px, 24vw, 380px)',
          gap: 'clamp(20px, 3vw, 48px)',
          alignItems: 'start',
        }}
        className="project-layout"
      >
        <article>
          <h1
            style={{
              fontSize: 'clamp(28px, 3.8vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {project.title}
          </h1>

          {project.shortDescription && (
            <p
              style={{
                color: '#475569',
                maxWidth: '70ch',
                fontSize: 17,
                margin: '0 0 20px',
                lineHeight: 1.6,
              }}
            >
              {project.shortDescription}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              margin: '20px 0',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                aria-label="Save"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: `1px solid ${saved ? '#2563EB' : '#E2E8F0'}`,
                  background: saved ? '#EFF6FF' : '#fff',
                  color: saved ? '#2563EB' : '#0F172A',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={share}
                aria-label="Share"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Share2 size={16} />
              </button>
            </div>

            {author && project.authorId !== user.id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minWidth: 260,
                  justifyContent: 'flex-end',
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {author.displayName
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <b style={{ fontSize: 14, display: 'block' }}>{author.displayName}</b>
                  <small style={{ color: '#64748B', fontSize: 12, display: 'block' }}>
                    {followers} followers
                  </small>
                </div>
                <button
                  onClick={toggleFollow}
                  style={{
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
                  {following ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </div>

          <ProjectDescription
            description={project.description}
            shortDescription={project.shortDescription}
            difficulty={project.difficulty}
            publishedAt={project.publishedAt}
            estimatedBuildTime={project.estimatedBuildTime}
            views={project.counts.views}
            category={category?.name ?? null}
            tags={[]}
          />

          <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <ProjectAccordion
              title="Components and tools"
              subtitle={`${components.length} part${components.length === 1 ? '' : 's'}`}
            >
              <ComponentTable components={components} />
            </ProjectAccordion>

            <ProjectAccordion
              title="Build process"
              subtitle={`${steps.length} step${steps.length === 1 ? '' : 's'}`}
            >
              <StepList steps={steps} />
            </ProjectAccordion>

            {codeSamples.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Code2 size={18} />
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <b style={{ display: 'block', fontSize: 15 }}>Code sample</b>
                  <small style={{ color: '#64748B', fontSize: 13, display: 'block' }}>
                    {codeSamples[0].filename}
                  </small>
                </div>
                <button
                  onClick={() => setOpenCode(codeSamples[0])}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  View code
                </button>
              </div>
            )}

            <ProjectAccordion
              title="Project files"
              subtitle={`${files.length} file${files.length === 1 ? '' : 's'}`}
            >
              <FileListSection
                files={files}
                projectId={project.id}
                canDownload={isOwner}
              />
            </ProjectAccordion>
          </div>

          <CommentSection
            projectId={project.id}
            comments={comments}
            onCommentPosted={(c) => setComments((prev) => [c, ...prev])}
          />
        </article>

        <aside
          style={{
            position: 'sticky',
            top: 88,
            display: 'grid',
            gap: 16,
          }}
          className="project-aside"
        >
          {author && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 18,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                About {author.displayName}
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                {author.bio || 'Creator on IDEVRX.'}
              </p>
              {isOwner && (
                <Link
                  to={`/studio/project/${project.id}`}
                  style={{
                    display: 'block',
                    marginTop: 14,
                    padding: '10px 16px',
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
          )}

          <RelatedProjects projects={related} />
        </aside>
      </div>

      {openCode && (
        <CodeDialog
          open={!!openCode}
          filename={openCode.filename}
          code={openCode.code}
          onClose={() => setOpenCode(null)}
        />
      )}

      <style>{`
        @media (max-width: 1180px) {
          .project-layout { grid-template-columns: 1fr !important; }
          .project-aside { position: static !important; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
        }
      `}</style>
    </div>
  );
}
