import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/useAuth';
import { NotificationPanel } from './NotificationPanel';

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
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

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
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="app-iconbtn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={18} />
            <NotificationBadge />
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

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
