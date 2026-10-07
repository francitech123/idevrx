import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePublicProjects } from '@/features/projects/useProjects';
import { useCurrentUser } from '@/features/auth/useAuth';
import { ProjectCard } from '@/components/project/ProjectCard';
import {
  Bot,
  Cpu,
  Code2,
  Wifi,
  Box,
  Eye,
  Zap,
  Terminal,
} from 'lucide-react';

/* --------------------------------------------- */
/* Journey band steps                            */
/* --------------------------------------------- */
const JOURNEY: { label: string; fail?: boolean }[] = [
  { label: 'Idea' },
  { label: 'Design' },
  { label: 'Plan' },
  { label: 'Build' },
  { label: 'Fail', fail: true },
  { label: 'Diagnose' },
  { label: 'Improve' },
  { label: 'Test' },
  { label: 'Document' },
  { label: 'Share' },
  { label: 'Remix' },
  { label: 'Version' },
];

/* --------------------------------------------- */
/* Platform grid                                 */
/* --------------------------------------------- */
const PLATFORM_ITEMS = [
  {
    n: '01',
    t: 'Discover',
    d: 'Find projects by engineering relevance — category, components, difficulty, cost, and creator.',
  },
  {
    n: '02',
    t: 'Learn',
    d: 'Tutorials and learning paths that connect theory to practical, documented builds.',
  },
  {
    n: '03',
    t: 'Build',
    d: 'Structured drafts: BOM, steps, code, schematics, files, and tests — progressively documented.',
  },
  {
    n: '04',
    t: 'Share',
    d: 'Publish with permanent project numbers, galleries, YouTube embeds, and downloadable files.',
  },
  {
    n: '05',
    t: 'Improve',
    d: 'Version history, remix lineage, technical discussion, and documented lessons.',
  },
];

/* --------------------------------------------- */
/* Domain chips                                  */
/* --------------------------------------------- */
const DOMAINS = [
  { label: 'Robotics', slug: 'robotics', icon: Bot },
  { label: 'Electronics', slug: 'electronics', icon: Cpu },
  { label: 'Embedded systems', slug: 'embedded-systems', icon: Code2 },
  { label: 'IoT', slug: 'iot-automation', icon: Wifi },
  { label: '3D fabrication', slug: '3d-design-fabrication', icon: Box },
  { label: 'Computer vision', slug: 'computer-vision', icon: Eye },
  { label: 'Automation', slug: 'iot-automation', icon: Zap },
  { label: 'Programming', slug: 'programming', icon: Terminal },
];

/* --------------------------------------------- */
/* Stats — real data from backend                */
/* --------------------------------------------- */
interface Stats {
  projects: number;
  creators: number;
  files: number;
}

function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';

    fetch(`${apiUrl}/api/v1/stats`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body && body.success && body.data) {
          setStats(body.data);
        }
      })
      .catch(() => {
        // Stats are non-critical; fail silently
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

/* --------------------------------------------- */
/* Page                                          */
/* --------------------------------------------- */
export function LandingPage() {
  const { user } = useCurrentUser();
  const stats = useStats();
  const { data: projectsData } = usePublicProjects({ limit: 3 });
  const featured = projectsData?.items ?? [];

  // Where should "Become a Creator" go?
  const becomeCreatorHref = user
    ? user.roles.includes('creator')
      ? '/studio/new'
      : '/creator/apply'
    : '/register?intent=creator';

  return (
    <>
      {/* ================= HERO ================= */}
      <header className="idx-hero">
        <div className="idx-hero-photo" />
        <div className="idx-hero-overlay" />
        <div className="idx-container idx-hero-inner">
          <div className="idx-hero-content">
            <div className="idx-hero-label">Real builds. Real data.</div>

            <h1 className="idx-hero-title">
              Ideas
              <br />
              engineered
              <br />
              into <span className="grad">reality.</span>
            </h1>

            <p className="idx-hero-sub">
              Documented, reproducible, improvable real-world projects — from
              robotics and embedded systems to fabrication and computer vision.
            </p>

            <div className="idx-hero-actions">
              <Link to="/explore" className="idx-btn idx-btn-hero-solid">
                Explore Projects →
              </Link>
              <Link to={becomeCreatorHref} className="idx-btn idx-btn-hero-brand">
                Become a Creator
              </Link>
            </div>

            <div className="idx-hero-stats">
              <div>
                <div className="idx-stat-num">
                  {stats ? stats.projects : 0}{' '}
                  <span className="idx-stat-tag">Live</span>
                </div>
                <div className="idx-stat-label">Engineering records</div>
              </div>
              <div>
                <div className="idx-stat-num">
                  {stats ? stats.files : 0}{' '}
                  <span className="idx-stat-tag">Live</span>
                </div>
                <div className="idx-stat-label">
                  Documented files,
                  <br />
                  uploaded &amp; versioned
                </div>
              </div>
              <div>
                <div className="idx-stat-num">
                  {stats ? stats.creators : 0}{' '}
                  <span className="idx-stat-tag">Live</span>
                </div>
                <div className="idx-stat-label">Active creators</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= JOURNEY BAND ================= */}
      <section className="idx-journey">
        <div className="idx-container">
          <div className="idx-journey-track">
            {JOURNEY.map((step, i) => (
              <span key={step.label} style={{ display: 'contents' }}>
                <span
                  className={`idx-journey-step${step.fail ? ' fail' : ''}`}
                >
                  {step.label}
                </span>
                {i < JOURNEY.length - 1 && (
                  <span className="idx-journey-arrow">→</span>
                )}
              </span>
            ))}
          </div>
          <p className="idx-journey-caption">
            <strong>Failure is engineering data.</strong> Every stage of the
            journey is documentable — not just the finished result.
          </p>
        </div>
      </section>

      {/* ================= PLATFORM ================= */}
      <section className="idx-block">
        <div className="idx-container">
          <div className="idx-eyebrow">The platform</div>
          <h2 className="idx-section-title">
            One platform for the whole build
          </h2>
          <p className="idx-section-sub">
            Project documentation, engineering knowledge, maker community, and
            software-style versioning — connected around real-world projects.
          </p>

          <div className="idx-platform-grid">
            {PLATFORM_ITEMS.map((item) => (
              <div key={item.n} className="idx-platform-card">
                <div className="idx-platform-num">{item.n}</div>
                <h3 className="idx-platform-title">{item.t}</h3>
                <p className="idx-platform-desc">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED PROJECTS ================= */}
      <section className="idx-block">
        <div className="idx-container">
          <div className="idx-section-head">
            <div className="idx-section-head-left">
              <div className="idx-eyebrow">Engineering records</div>
              <h2 className="idx-section-title">
                Featured engineering records
              </h2>
              <p className="idx-section-sub">
                Live content — every card below is served from the IDEVRX
                backend database.
              </p>
            </div>
            <div className="idx-section-head-right">
              <Link to="/explore" className="idx-btn idx-btn-outline">
                Browse All Projects →
              </Link>
            </div>
          </div>

          {featured.length === 0 ? (
            <div className="idx-empty-projects">
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: 12,
                }}
              >
                No published projects yet
              </p>
              <p style={{ marginBottom: 24 }}>
                Be the first to document an engineering project on IDEVRX.
              </p>
              <Link to={becomeCreatorHref} className="idx-btn idx-btn-primary">
                Become a Creator →
              </Link>
            </div>
          ) : (
            <div className="idx-projects-grid">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= DOMAINS ================= */}
      <section className="idx-block">
        <div className="idx-container">
          <div className="idx-eyebrow">Domains</div>
          <h2 className="idx-section-title">Explore by domain</h2>
          <p className="idx-section-sub">
            Robotics is where IDEVRX starts — not where it ends.
          </p>

          <div className="idx-domains">
            {DOMAINS.map((d) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.label}
                  to={`/explore?category=${d.slug}`}
                  className="idx-domain-chip"
                >
                  <Icon className="idx-domain-icon" size={16} />
                  {d.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY ================= */}
      <section className="idx-block">
        <div className="idx-container">
          <div className="idx-eyebrow">Community</div>
          <h2 className="idx-section-title">Two journeys, one platform</h2>

          <div className="idx-journeys-grid">
            {/* Creator journey */}
            <div className="idx-journey-card">
              <h3>Creator journey</h3>
              <p>
                For authorized Creators — the only role that can author
                projects.
              </p>
              <div className="idx-flow">
                {['Draft', 'Document', 'Upload', 'Preview'].map((s) => (
                  <span key={s} style={{ display: 'contents' }}>
                    <span className="idx-flow-step">{s}</span>
                    <span className="idx-flow-arrow">→</span>
                  </span>
                ))}
                <span className="idx-flow-step highlight">Publish</span>
              </div>
              <Link to="/creator-guidelines" className="idx-journey-cta">
                Read Creator Guidelines →
              </Link>
            </div>

            {/* Builder journey */}
            <div className="idx-journey-card">
              <h3>Builder journey</h3>
              <p>For Registered Users — learn, reproduce, and discuss.</p>
              <div className="idx-flow">
                {['Discover', 'Read', 'Watch', 'Download'].map((s) => (
                  <span key={s} style={{ display: 'contents' }}>
                    <span className="idx-flow-step">{s}</span>
                    <span className="idx-flow-arrow">→</span>
                  </span>
                ))}
                <span className="idx-flow-step highlight">Learn</span>
              </div>
              <Link to="/community-guidelines" className="idx-journey-cta">
                Community Guidelines →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LEARNING ================= */}
      <section className="idx-block">
        <div className="idx-container">
          <div className="idx-section-head">
            <div className="idx-section-head-left">
              <div className="idx-eyebrow">Learning</div>
              <h2 className="idx-section-title">
                Learning paths connect projects into progress
              </h2>
              <p className="idx-section-sub">
                Paths reference real projects — they never duplicate project
                content.
              </p>
            </div>
            <div className="idx-section-head-right">
              <Link to="/learning" className="idx-btn idx-btn-outline">
                All Learning Paths →
              </Link>
            </div>
          </div>

          <div className="idx-path-card">
            <div className="idx-path-header">
              <div className="idx-path-title">
                Path: Robotics fundamentals
              </div>
              <div className="idx-path-progress">
                Coming soon — learning paths are part of a future release
              </div>
            </div>
            <div className="idx-path-timeline">
              {[
                'Fundamentals',
                'Electronics',
                'Micro-controllers',
                'Sensors',
                'Motors',
                'Embedded programming',
                'Robotics',
                'Computer vision',
              ].map((label) => (
                <div key={label} className="idx-path-step">
                  <div className="idx-path-dot" />
                  <div className="idx-path-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <div className="idx-final-cta-wrap">
        <div className="idx-container">
          <div className="idx-final-cta">
            <div className="idx-final-cta-inner">
              <div className="idx-eyebrow center">Join IDEVRX</div>
              <h2>Document how you engineered it.</h2>
              <p>
                IDEVRX isn't where you just show what you built. It's where you
                give others everything they need to build it, learn from it,
                improve it, and take it further.
              </p>
              <div className="idx-final-cta-actions">
                <Link
                  to={becomeCreatorHref}
                  className="idx-btn idx-btn-primary"
                >
                  Become a Creator →
                </Link>
                <Link
                  to="/creator-guidelines"
                  className="idx-btn idx-btn-outline"
                >
                  Creator Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
