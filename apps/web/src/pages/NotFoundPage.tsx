import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="max-w-reading mx-auto px-6 py-24 text-center">
      <p className="text-sm font-mono text-text-muted mb-2">404</p>
      <h1 className="text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
