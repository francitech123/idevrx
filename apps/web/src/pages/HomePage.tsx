import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/brand/LogoMark';

export function HomePage() {
  return (
    <div className="max-w-container mx-auto px-6 py-16">
      <div className="max-w-reading">
        <div className="mb-6">
          <LogoMark size={56} />
        </div>
        <p className="text-sm font-mono text-brand-primary mb-3">IDEVRX FOUNDATION</p>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-4">
          Ideas engineered into reality.
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          IDEVRX is where ideas become documented, reproducible, and improvable real-world projects.
          Discover, learn, build, share, improve.
        </p>
        <div className="flex gap-3">
          <Link to="/register">
            <Button size="lg">Create account</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t: 'Discover', d: 'Find engineering projects by category, difficulty, cost, and components.' },
          { t: 'Learn', d: 'Follow learning paths from fundamentals through advanced engineering.' },
          { t: 'Build', d: 'Document your own projects with steps, BOM, code, and files.' },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-card border border-border bg-surface p-5">
            <h3 className="font-semibold text-text-primary mb-1">{t}</h3>
            <p className="text-sm text-text-secondary">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
