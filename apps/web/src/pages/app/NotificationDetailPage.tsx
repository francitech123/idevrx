import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  Bookmark,
  Award,
  Trash2,
  ExternalLink,
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

function iconFor(type: string) {
  switch (type) {
    case 'comment':
    case 'reply':
      return <MessageCircle size={22} />;
    case 'like':
      return <Heart size={22} />;
    case 'bookmark':
      return <Bookmark size={22} />;
    case 'follow':
      return <UserPlus size={22} />;
    case 'publish':
      return <Award size={22} />;
    default:
      return <Bell size={22} />;
  }
}

export function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';

    fetch(`${apiUrl}/api/v1/me/notifications/${id}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then((body) => {
        if (body.success) setNotification(body.data.notification);
        else setError('Not found');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch(`${apiUrl}/api/v1/me/notifications/${id}/read`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, [id]);

  async function remove() {
    if (!id) return;
    if (!confirm('Delete this notification?')) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    const res = await fetch(`${apiUrl}/api/v1/me/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) navigate('/notifications');
  }

  if (loading) {
    return (
      <div>
        <div
          style={{
            height: 200,
            borderRadius: 16,
            background: '#E2E8F0',
            marginBottom: 20,
          }}
        />
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div style={{ padding: 64, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Notification not found</h2>
        <Link
          to="/notifications"
          style={{
            color: '#2563EB',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Back to notifications
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/notifications')}
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
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={14} /> All notifications
      </button>

      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {iconFor(notification.type)}
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748B',
              }}
            >
              {notification.type}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {new Date(notification.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {notification.actor && (
          <div
            style={{
              padding: 14,
              background: '#F8FAFC',
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
              From
            </div>
            <div style={{ fontWeight: 600 }}>
              {notification.actor.displayName}
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              @{notification.actor.username}
            </div>
          </div>
        )}

        <div
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: '#0F172A',
            marginBottom: 24,
          }}
        >
          {notification.message}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {notification.link && (
            <Link
              to={notification.link}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background:
                  'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
                color: '#fff',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} />
              Open
            </Link>
          )}
          <button
            onClick={remove}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              border: '1px solid #E2E8F0',
              background: '#fff',
              color: '#DC2626',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
