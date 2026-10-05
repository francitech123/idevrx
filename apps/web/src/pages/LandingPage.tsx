import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePublicProjects } from '@/features/projects/useProjects';
import { useCurrentUser } from '@/features/auth/useAuth';
import { LogoMark } from '@/components/brand/LogoMark';
import { ProjectCard } from '@/components/project/ProjectCard';
import {
  MapPin,
  Cpu,
  Code2,
  Wifi,
  Box,
  Eye,
  Zap,
  Terminal,
  ArrowRight,
} from 'lucide-react';

/* ---------------------------------- */
/* Backend stats hook — real data only */
/* ---------------------------------- */

interface Stats {
  projects: number;
  creators: number;
  files: number;
}

function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/stats`, { credentials: 'include' })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setStats(body.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

/* ---------------------------------- */
/* Small design primitives (inline)   */
/* ---------------------------------- */

function MonoButton({
  to,
  children,
  variant = 'outline',
}: {
  to: string;
  children: React.ReactNode;
  variant?: 'outline' | 'solid';
}) {
  const base =
    'inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] transition-colors';
  const styles =
    variant === 'solid'
      ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
      : 'border border-border-strong text-text-primary hover:border-brand-primary hover:text-brand-primary';
  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-primary mb-4">
      {children}
    </p>
  );
}

function FlowStep({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center px-4 py-3 border border-border-strong rounded-button font-mono text-xs uppercase tracking-[0.15em] text-text-primary bg-surface">
      {children}
    </span>
  );
}

function FlowArrow() {
  return <ArrowRight size={16} className="text-text-muted shrink-0" />;
}

function DomainChip({
  icon,
  label,
  slug,
}: {
  icon: React.ReactNode;
  label: string;
  slug: string;
}) {
  return (
    <Link
      to={`/explore?category=${slug}`}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-button border border-border bg-surface text-text-primary hover:border-brand-primary hover:text-brand-primary transition-colors"
    >
      <span className="text-brand-primary">{icon}</span>
      <span className="font-mono text-xs uppercase tracking-[0.1em]">{label}</span>
    </Link>
  );
}

/* ---------------------------------- */
/* Page                                */
/* ---------------------------------- */

export function LandingPage() {
  const { user } = useCurrentUser();
  const { stats, loading: statsLoading } = useStats();
  const { data: projectsData } = usePublicProjects({ limit: 3 });
  const featured = projectsData?.items ?? [];

  return (
    <div>
      {/* ---------------------------------- HERO ---------------------------------- */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-6">
                Ideas engineered <br className="hidden md:block" />
                into reality.
              </h1>
              <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
                Documented, reproducible, improvable real-world projects — from
                robotics and embedded systems to fabrication and computer vision.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
                >
                  Explore Projects
                  <ArrowRight size={14} />
                </Link>
                {user ? (
                  <Link
                    to={user.roles.includes('creator') ? '/studio/new' : '/creator/apply'}
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] border border-border-strong text-text-primary hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    {user.roles.includes('creator') ? 'Open Studio' : 'Become a Creator'}
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to="/register?intent=creator"
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] border border-border-strong text-text-primary hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    Become a Creator
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Right side: isometric logo mark placeholder for hero illustration */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full opacity-20 blur-3xl"
                  style={{ background: 'var(--brand-gradient)' }}
                />
                <LogoMark size={220} />
              </div>
            </div>
          </div>

          {/* Stats — real data only */}
          {!statsLoading && stats && (
            <div className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat label="Engineering records" value={stats.projects} />
              <Stat label="Active creators" value={stats.creators} />
              <Stat label="Files documented" value={stats.files} />
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------- 01 — ONE PLATFORM ---------------------------------- */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6 py-20 md:py-28">
          <Eyebrow>01 — Platform</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl mb-5">
            One platform for the whole build.
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mb-16">
            Project documentation, engineering knowledge, maker community, and
            software-style versioning — connected around real-world projects.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {[
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
            ].map((item) => (
              <div key={item.n}>
                <p className="font-mono text-xs text-brand-primary mb-3">{item.n}</p>
                <h3 className="text-xl font-semibold mb-2">{item.t}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- FEATURED PROJECTS ---------------------------------- */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6 py-20 md:py-28">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <Eyebrow>Projects</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Recent engineering records.
              </h2>
            </div>
            <Link
              to="/explore"
              className="hidden md:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-brand-primary hover:underline"
            >
              All projects
              <ArrowRight size={14} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-12 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted mb-3">
                No published projects yet
              </p>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Be the first to document an engineering project on IDEVRX.
              </p>
              <Link
                to={user ? '/creator/apply' : '/register?intent=creator'}
                className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
              >
                Become a Creator
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------- DOMAINS ---------------------------------- */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <Eyebrow>Domains</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Explore by domain.
              </h2>
              <p className="text-text-secondary">
                Robotics is where IDEVRX starts — not where it ends.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-wrap gap-3">
              <DomainChip icon={<MapPin size={16} />} label="Robotics" slug="robotics" />
              <DomainChip icon={<Cpu size={16} />} label="Electronics" slug="electronics" />
              <DomainChip icon={<Code2 size={16} />} label="Embedded systems" slug="embedded-systems" />
              <DomainChip icon={<Wifi size={16} />} label="IoT" slug="iot-automation" />
              <DomainChip icon={<Box size={16} />} label="3D fabrication" slug="3d-design-fabrication" />
              <DomainChip icon={<Eye size={16} />} label="Computer vision" slug="computer-vision" />
              <DomainChip icon={<Zap size={16} />} label="Automation" slug="iot-automation" />
              <DomainChip icon={<Terminal size={16} />} label="Programming" slug="programming" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------- TWO JOURNEYS ---------------------------------- */}
      <section className="border-b border-border">
        <div className="max-w-container mx-auto px-6 py-20 md:py-28">
          <Eyebrow>Community</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-16 max-w-3xl">
            Two journeys, one platform.
          </h2>

          <div className="space-y-14">
            {/* Creator journey */}
            <div>
              <h3 className="text-2xl font-semibold mb-2">Creator journey</h3>
              <p className="text-text-secondary mb-6">
                For authorized Creators — the only role that can author projects.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <FlowStep>Draft</FlowStep>
                <FlowArrow />
                <FlowStep>Document</FlowStep>
                <FlowArrow />
                <FlowStep>Upload</FlowStep>
                <FlowArrow />
                <FlowStep>Preview</FlowStep>
                <FlowArrow />
                <FlowStep>Publish</FlowStep>
              </div>
              <MonoButton to="/creator-guidelines">Read Creator Guidelines</MonoButton>
            </div>

            {/* Builder journey */}
            <div>
              <h3 className="text-2xl font-semibold mb-2">Builder journey</h3>
              <p className="text-text-secondary mb-6">
                For Registered Users — learn, reproduce, and discuss.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <FlowStep>Discover</FlowStep>
                <FlowArrow />
                <FlowStep>Read</FlowStep>
                <FlowArrow />
                <FlowStep>Watch</FlowStep>
                <FlowArrow />
                <FlowStep>Download</FlowStep>
                <FlowArrow />
                <FlowStep>Learn</FlowStep>
              </div>
              <MonoButton to="/community-guidelines">Community Guidelines</MonoButton>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------- FINAL CTA ---------------------------------- */}
      <section>
        <div className="max-w-container mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
            Document what you built.
            <br />
            Let others build it further.
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10">
            IDEVRX is where ideas become structured engineering records — and where
            those records become the foundation for the next build.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <MonoButton to="/explore" variant="solid">Explore Projects</MonoButton>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
                >
                  Get Started
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 h-12 rounded-button font-mono text-xs uppercase tracking-[0.15em] border border-border-strong text-text-primary hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
        {value.toLocaleString()}
      </p>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
        {label}
      </p>
    </div>
  );
}
