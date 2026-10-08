import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Heart,
  UserPlus,
  Bookmark,
  Award,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  actor: { id: string; username: string; displayName: string } | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

function iconFor(type: string) {
  switch (type) {
    case 'comment':
      return <MessageCircle size={16} />;
    case 'reply':
      return <MessageCircle size={16} />;
    case 'like':
      return <Heart size={16} />;
    case 'bookmark':
      return <Bookmark size={16} />;
    case 'follow':
      return <UserPlus size={16} />;
    case 'publish':
      return <Award size={16} />;
    default:
      return <Bell size={16} />;
  }
}

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError(null);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/me/notifications`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load');
      const body = await res.json();
      if (body.success) setItems(body.data.notifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    await fetch(`${apiUrl}/api/v1/me/notifications/read-all`, {
      method: 'POST',
      credentials: 'include',
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function removeOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this notification?')) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const res = await fetch(`${apiUrl}/api/v1/me/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setItems((prev) => prev.filter((n) => n.id !== id));
  }

  async function clearAll() {
    if (!confirm('Delete all notifications?')) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const res = await fetch(`${apiUrl}/api/v1/me/notifications`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setItems([]);
  }

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            Notifications
          </h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: '9px 16px',
                border: '1px solid #E2E8F0',
                background: '#fff',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={14} />
              Mark all read
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: '9px 16px',
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: '#DC2626',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Trash2 size={14} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 72,
                borderRadius: 12,
                background: '#E2E8F0',
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
            onClick={load}
            style={{
              padding: '10px 18px',
              border: '1px solid #E2E8F0',
              background: '#fff',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            border: '1px dashed #CBD5E1',
            borderRadius: 16,
            color: '#64748B',
          }}
        >
          <Bell size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3 style={{ marginBottom: 8, color: '#0F172A' }}>No notifications</h3>
          <p>When people interact with your projects, you'll see it here.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(`/notifications/${n.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                background: n.read ? '#fff' : '#EFF6FF',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (n.read) (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (n.read) (e.currentTarget as HTMLDivElement).style.background = '#fff';
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: n.read ? '#F1F5F9' : '#DBEAFE',
                  color: n.read ? '#64748B' : '#2563EB',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {iconFor(n.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: '#0F172A',
                    marginBottom: 4,
                    fontWeight: n.read ? 500 : 600,
                  }}
                >
                  {n.actor ? `${n.actor.displayName} — ` : ''}
                  {n.message}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {timeAgo(n.createdAt)}
                </div>
              </div>

              <button
                onClick={(e) => removeOne(n.id, e)}
                aria-label="Delete notification"
                style={{
                  border: 0,
                  background: 'none',
                  padding: 8,
                  borderRadius: 8,
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
