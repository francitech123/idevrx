import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/me/notifications`, {
        credentials: 'include',
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) setItems(body.data.notifications);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      await fetch(`${apiUrl}/api/v1/me/notifications/read-all`, {
        method: 'POST',
        credentials: 'include',
      });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  function handleClick(n: Notification) {
    if (n.link) navigate(n.link);
    onClose();
  }

  return (
    <div className="app-np">
      <div className="app-np-head">
        <b>Notifications</b>
        <button className="app-np-markall" onClick={markAllRead}>
          Mark all read
        </button>
      </div>

      {loading && (
        <div className="app-np-item">
          <div className="app-np-item-time">Loading...</div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="app-np-item">
          <div className="app-np-item-time">No notifications yet.</div>
        </div>
      )}

      {!loading &&
        items.map((n) => (
          <div
            key={n.id}
            className={`app-np-item${n.read ? '' : ' unread'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => handleClick(n)}
          >
            <div className="app-np-item-title">
              {n.actor ? `${n.actor.displayName} — ` : ''}
              {n.message}
            </div>
            <div className="app-np-item-time">{timeAgo(n.createdAt)}</div>
          </div>
        ))}
    </div>
  );
}
