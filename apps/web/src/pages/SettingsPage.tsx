import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/useAuth';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account and security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'playback', label: 'Playback' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'appearance', label: 'Appearance and language' },
  { key: 'data', label: 'Your data' },
  { key: 'creator', label: 'Creator access' },
];

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const active = tab ?? 'profile';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          Settings
        </h1>
        <p style={{ color: '#64748B', fontSize: 14 }}>
          Control your account, privacy, and how IDEVRX works for you.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="settings-grid"
      >
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: 'sticky',
            top: 88,
          }}
          className="settings-tabs"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate(`/settings/${t.key}`)}
              style={{
                textAlign: 'left',
                border: 0,
                background: active === t.key ? '#EFF6FF' : 'none',
                padding: '10px 12px',
                borderRadius: 10,
                fontWeight: 500,
                color: active === t.key ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 'clamp(16px, 2.4vw, 28px)',
          }}
        >
          {active === 'profile' && <ProfileTab />}
          {active === 'account' && <AccountTab />}
          {active === 'notifications' && <NotificationsTab />}
          {active === 'playback' && <PlaybackTab />}
          {active === 'privacy' && <PrivacyTab />}
          {active === 'appearance' && <AppearanceTab />}
          {active === 'data' && <DataTab />}
          {active === 'creator' && <CreatorTab />}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-tabs { flex-direction: row !important; overflow-x: auto; position: static !important; }
          .settings-tabs button { white-space: nowrap; }
        }
      `}</style>
    </div>
  );
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
      {action}
    </div>
  );
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
          {description}
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 20,
        border: 0,
        background: on ? '#2563EB' : '#CBD5E1',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          top: 3,
          left: on ? 21 : 3,
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}

function SaveBtn({
  onClick,
  busy,
  children,
}: {
  onClick: () => void;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        padding: '9px 18px',
        background: '#2563EB',
        color: '#fff',
        border: 0,
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 13,
        cursor: busy ? 'wait' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {busy ? 'Saving...' : children}
    </button>
  );
}

function SmallBtn({
  onClick,
  variant = 'default',
  children,
}: {
  onClick: () => void;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        border:
          variant === 'danger' ? '1px solid #DC2626' : '1px solid #E2E8F0',
        color: variant === 'danger' ? '#DC2626' : '#0F172A',
        background: '#fff',
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

const api = () => import.meta.env.VITE_API_URL ?? '';

function ProfileTab() {
  const { user, refetch } = useCurrentUser();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio ?? '');
    }
  }, [user]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${api()}/api/v1/profiles/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio }),
      });
      if (res.ok) {
        await refetch();
        setMsg('Profile saved');
      } else {
        setMsg('Failed to save');
      }
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <SectionHead title="Profile" />
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 22,
            marginBottom: 12,
          }}
        >
          {user.displayName
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <label
          style={{
            display: 'block',
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={64}
            style={{
              display: 'block',
              width: '100%',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '10px 12px',
              marginTop: 5,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 400,
            }}
          />
        </label>
        <label
          style={{
            display: 'block',
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            style={{
              display: 'block',
              width: '100%',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '10px 12px',
              marginTop: 5,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 400,
              resize: 'vertical',
            }}
          />
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SaveBtn onClick={save} busy={busy}>
            Save changes
          </SaveBtn>
          {msg && (
            <span style={{ fontSize: 13, color: '#16A34A' }}>{msg}</span>
          )}
        </div>
      </div>

      <SettingRow
        title="Username"
        description="Your unique handle on IDEVRX."
        action={<span style={{ color: '#64748B', fontSize: 14 }}>@{user.username}</span>}
      />
      <SettingRow
        title="Public profile link"
        description="Share this with others."
        action={
          <span style={{ color: '#64748B', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            /@ {user.username}
          </span>
        }
      />
    </div>
  );
}

function AccountTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [deletion, setDeletion] = useState<any>(null);

  useEffect(() => {
    fetch(`${api()}/api/v1/account/status`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setDeletion(b.data);
      })
      .catch(() => {});
  }, []);

  async function changePassword() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${api()}/api/v1/account/password/change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        setMsg('Password changed successfully');
        setCurrent('');
        setNext('');
      } else {
        setMsg(body?.error?.message ?? 'Failed to change password');
      }
    } finally {
      setBusy(false);
    }
  }

  async function requestDeletion() {
    if (!confirm('Schedule account deletion? You will have a grace period.')) return;
    const res = await fetch(`${api()}/api/v1/account/delete/request`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '' }),
    });
    if (res.ok) {
      const b = await res.json();
      setDeletion({ deletionPending: true, scheduledFor: b.data.scheduledFor });
    }
  }

  async function cancelDeletion() {
    const res = await fetch(`${api()}/api/v1/account/delete/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) setDeletion({ deletionPending: false });
  }

  return (
    <div>
      <SectionHead title="Account and security" />

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
          Change password
        </div>
        <input
          type="password"
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 8,
            fontFamily: 'inherit',
            fontSize: 14,
          }}
        />
        <input
          type="password"
          placeholder="New password (10+ chars, upper, lower, number)"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 10,
            fontFamily: 'inherit',
            fontSize: 14,
          }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveBtn onClick={changePassword} busy={busy}>
            Update password
          </SaveBtn>
          {msg && (
            <span
              style={{
                fontSize: 13,
                color: msg.includes('success') ? '#16A34A' : '#DC2626',
              }}
            >
              {msg}
            </span>
          )}
        </div>
      </div>

      <SettingRow
        title="Two-factor authentication"
        description="Coming soon."
        action={<span style={{ fontSize: 12, color: '#64748B' }}>Not available yet</span>}
      />

      <div style={{ marginTop: 24 }}>
        <SectionHead title="Danger zone" />
        {deletion?.deletionPending ? (
          <div
            style={{
              padding: 16,
              border: '1px solid #FCA5A5',
              background: '#FEF2F2',
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Account deletion scheduled
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              Scheduled for{' '}
              {deletion.scheduledFor
                ? new Date(deletion.scheduledFor).toLocaleString()
                : 'soon'}
            </div>
            <SmallBtn onClick={cancelDeletion}>Cancel deletion</SmallBtn>
          </div>
        ) : (
          <SettingRow
            title="Delete account"
            description="Permanently remove your profile and activity."
            action={<SmallBtn onClick={requestDeletion} variant="danger">Delete</SmallBtn>}
          />
        )}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${api()}/api/v1/profiles/me/preferences`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setPrefs(b.data.preferences);
      })
      .catch(() => {});
  }, []);

  async function update(key: string, value: boolean) {
    setPrefs((p: any) => ({
      ...p,
      notifications: { ...p.notifications, [key]: value },
    }));
    setBusy(true);
    try {
      await fetch(`${api()}/api/v1/profiles/me/preferences`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: { [key]: value } }),
      });
    } finally {
      setBusy(false);
    }
  }

  if (!prefs) return <div>Loading...</div>;

  const items: [string, string, string][] = [
    ['newUploads', 'New uploads', 'Videos and posts from creators you follow.'],
    ['comments', 'Comments', 'Someone comments on your content.'],
    ['replies', 'Replies', 'Someone replies to your comment.'],
    ['likes', 'Likes', 'Someone likes your content.'],
    ['follows', 'New followers', 'Someone follows you.'],
    ['learning', 'Courses', 'New lessons and certificate updates.'],
    ['emailDigest', 'Weekly email digest', 'A summary of what you missed.'],
  ];

  return (
    <div>
      <SectionHead title="Notifications" />
      {items.map(([key, title, desc]) => (
        <SettingRow
          key={key}
          title={title}
          description={desc}
          action={
            <Toggle
              on={!!prefs.notifications[key]}
              onChange={(v) => update(key, v)}
              label={title}
            />
          }
        />
      ))}
    </div>
  );
}

function PlaybackTab() {
  const [prefs, setPrefs] = useState<any>(null);

  useEffect(() => {
    fetch(`${api()}/api/v1/profiles/me/preferences`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setPrefs(b.data.preferences);
      })
      .catch(() => {});
  }, []);

  async function update(patch: any) {
    setPrefs((p: any) => ({ ...p, playback: { ...p.playback, ...patch } }));
    await fetch(`${api()}/api/v1/profiles/me/preferences`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playback: patch }),
    });
  }

  if (!prefs) return <div>Loading...</div>;

  return (
    <div>
      <SectionHead title="Playback" />
      <SettingRow
        title="Autoplay"
        description="Play the next video automatically."
        action={
          <Toggle
            on={!!prefs.playback.autoplay}
            onChange={(v) => update({ autoplay: v })}
            label="Autoplay"
          />
        }
      />
      <SettingRow
        title="Captions"
        description="Show captions when available."
        action={
          <Toggle
            on={!!prefs.playback.captions}
            onChange={(v) => update({ captions: v })}
            label="Captions"
          />
        }
      />
      <SettingRow
        title="Data saver"
        description="Lower quality on mobile data."
        action={
          <Toggle
            on={!!prefs.playback.dataSaver}
            onChange={(v) => update({ dataSaver: v })}
            label="Data saver"
          />
        }
      />
      <SettingRow
        title="Default quality"
        description="Applies to every video."
        action={
          <select
            value={prefs.playback.quality}
            onChange={(e) => update({ quality: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        }
      />
      <SettingRow
        title="Playback speed"
        description="Your default speed."
        action={
          <select
            value={prefs.playback.speed}
            onChange={(e) => update({ speed: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {['0.5x', '1x', '1.25x', '1.5x', '2x'].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}

function PrivacyTab() {
  const [prefs, setPrefs] = useState<any>(null);

  useEffect(() => {
    fetch(`${api()}/api/v1/profiles/me/preferences`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setPrefs(b.data.preferences);
      })
      .catch(() => {});
  }, []);

  async function update(key: string, value: boolean) {
    setPrefs((p: any) => ({ ...p, privacy: { ...p.privacy, [key]: value } }));
    await fetch(`${api()}/api/v1/profiles/me/preferences`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privacy: { [key]: value } }),
    });
  }

  if (!prefs) return <div>Loading...</div>;

  const items: [string, string, string][] = [
    ['publicProfile', 'Public profile', 'Let anyone view your profile.'],
    ['showLikes', 'Show liked projects', 'Display your likes on your profile.'],
    ['showHistory', 'Show watch history', 'Let others see what you viewed.'],
    ['allowComments', 'Allow comments', 'Let people comment on your posts.'],
    ['personalisedRecommendations', 'Personalised recommendations', 'Use activity to suggest builds.'],
  ];

  return (
    <div>
      <SectionHead title="Privacy" />
      {items.map(([key, title, desc]) => (
        <SettingRow
          key={key}
          title={title}
          description={desc}
          action={
            <Toggle
              on={!!prefs.privacy[key]}
              onChange={(v) => update(key, v)}
              label={title}
            />
          }
        />
      ))}
    </div>
  );
}

function AppearanceTab() {
  const [prefs, setPrefs] = useState<any>(null);

  useEffect(() => {
    fetch(`${api()}/api/v1/profiles/me/preferences`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setPrefs(b.data.preferences);
      })
      .catch(() => {});
  }, []);

  async function update(patch: any) {
    setPrefs((p: any) => ({ ...p, appearance: { ...p.appearance, ...patch } }));
    await fetch(`${api()}/api/v1/profiles/me/preferences`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appearance: patch }),
    });
    if (patch.theme) {
      const r = document.documentElement;
      if (patch.theme === 'Light') r.dataset.theme = 'light';
      else if (patch.theme === 'Dark') r.dataset.theme = 'dark';
      else delete r.dataset.theme;
    }
  }

  if (!prefs) return <div>Loading...</div>;

  return (
    <div>
      <SectionHead title="Appearance and language" />
      <SettingRow
        title="Theme"
        description="Light, dark, or follow your device."
        action={
          <select
            value={prefs.appearance.theme}
            onChange={(e) => update({ theme: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {['System', 'Light', 'Dark'].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        }
      />
      <SettingRow
        title="Language"
        description="Language used across IDEVRX."
        action={
          <select
            value={prefs.appearance.language}
            onChange={(e) => update({ language: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {['English', 'French', 'Yoruba', 'Hausa', 'Igbo'].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}

function DataTab() {
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${api()}/api/v1/me/history`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.success) setHistoryCount((b.data.items ?? []).length);
      })
      .catch(() => {});
  }, []);

  async function clearHistory() {
    if (!confirm('Clear your entire watch history?')) return;
    await fetch(`${api()}/api/v1/me/history`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setHistoryCount(0);
  }

  async function requestExport() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`${api()}/api/v1/account/data-export`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) setMsg('Export requested. You will get an email when it is ready.');
    setBusy(false);
  }

  return (
    <div>
      <SectionHead title="Your data" />
      <SettingRow
        title="Watch history"
        description={`${historyCount} items.`}
        action={<SmallBtn onClick={clearHistory}>Clear history</SmallBtn>}
      />
      <SettingRow
        title="Download your data"
        description="Get a copy of your profile and activity."
        action={
          <SaveBtn onClick={requestExport} busy={busy}>
            Request export
          </SaveBtn>
        }
      />
      {msg && (
        <div style={{ marginTop: 14, fontSize: 13, color: '#16A34A' }}>{msg}</div>
      )}
    </div>
  );
}

function CreatorTab() {
  const { user } = useCurrentUser();

  if (user?.roles.includes('creator')) {
    return (
      <div>
        <SectionHead title="Creator access" />
        <p style={{ color: '#64748B', marginBottom: 20 }}>
          You have Creator access. Open Creator Studio to manage your projects.
        </p>
        <a
          href="/studio"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background:
              'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
            color: '#fff',
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open Creator Studio
        </a>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Creator access" />
      <p style={{ color: '#64748B', marginBottom: 20 }}>
        Publish build videos, posts, and project documentation. Only approved
        Creators can upload.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href="/creator/apply"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background:
              'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
            color: '#fff',
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Apply to become a Creator
        </a>
        <a
          href="/creator-guidelines"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: '#fff',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Read the Creator guide
        </a>
      </div>
    </div>
  );
}
