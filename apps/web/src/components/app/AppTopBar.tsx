import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useAuth';
import { LogoMark } from '@/components/brand/LogoMark';

interface Props {
  onOpenSidebar: () => void;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AppTopBar({ onOpenSidebar }: Props) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  }

  return (
    <header className="app-top">
      <button
        type="button"
        className="app-burger"
        aria-label="Open menu"
        onClick={onOpenSidebar}
      >
        <Menu size={20} />
      </button>

      <button
        type="button"
        className="app-top-logo"
        onClick={() => navigate('/home')}
        aria-label="IDEVRX home"
      >
        <LogoMark size={30} />
      </button>

      <form className="app-search" onSubmit={handleSearch}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search projects, creators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
      </form>

      <div className="app-actions">
        <button
          type="button"
          className="app-iconbtn"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <Bell size={18} />
          <NotificationBadge />
        </button>

        <button
          type="button"
          className="app-avatar"
          onClick={() => navigate('/settings')}
          aria-label="Your profile"
        >
          {user ? initials(user.displayName) : '?'}
        </button>
      </div>
    </header>
  );
}

function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/me/notifications`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body && body.success && typeof body.data.unread === 'number') {
          setCount(body.data.unread);
        }
      })
      .catch(() => {});
  }, []);

  if (count <= 0) return null;
  return <span className="app-badge">{count > 99 ? '99+' : count}</span>;
}
