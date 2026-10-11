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

const api = () => import.meta.env.VITE_API_URL ?? '';

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const active = tab ?? 'profile';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            color: 'var(--color-ink)',
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 15,
          }}
        >
          Control your account, privacy, and how IDEVRX works for you.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          gap: 28,
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
                background:
                  active === t.key ? 'var(--color-card)' : 'transparent',
                padding: '10px 14px',
                borderRadius: 6,
                fontWeight: 500,
                color:
                  active === t.key ? 'var(--color-ink)' : 'var(--color-muted)',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                borderLeft:
                  active === t.key
                    ? '3px solid var(--color-accent)'
                    : '3px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            borderRadius: 10,
            padding: 'clamp(20px, 2.4vw, 28px)',
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
          .settings-tabs button { white-space: nowrap; border-left: 0 !important; border-bottom: 3px solid transparent; }
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
        marginBottom: 20,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: '-0.012em',
          color: 'var(--color-ink)',
        }}
      >
        {title}
      </h2>
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
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--color-ink)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginTop: 2,
          }}
        >
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
        background: on ? 'var(--color-accent)' : 'var(--color-line-strong)',
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
          background: 'var(--color-paper)',
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
        background: 'var(--color-accent)',
        color: 'var(--color-on-ink)',
        border: 0,
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 13,
        cursor: busy ? 'wait' : 'pointer',
        fontFamily: 'var(--font-sans)',
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
          variant === 'danger'
            ? '1px solid var(--color-error)'
            : '1px solid var(--color-line-strong)',
        color:
          variant === 'danger' ? 'var(--color-error)' : 'var(--color-ink)',
        background: 'var(--color-paper)',
        borderRadius: 6,
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </button>
  );
}

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        display: 'block',
        width: '100%',
        border: '1px solid var(--color-line)',
        borderRadius: 6,
        padding: '10px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 400,
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
        outline: 'none',
      }}
    />
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 13,
        color: 'var(--color-ink)',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        border: '1px solid var(--color-line)',
        borderRadius: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
        outline: 'none',
      }}
    >
      {options.map((q) => (
        <option key={q} value={q}>
          {q}
        </option>
      ))}
    </select>
  );
}

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
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--color-on-ink)',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 28,
            marginBottom: 16,
          }}
        >
          {user.displayName
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div style={{ marginBottom: 14 }}>
          <Label>Display name</Label>
          <Input value={displayName} onChange={setDisplayName} maxLength={64} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Label>Bio</Label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            style={{
              display: 'block',
              width: '100%',
              border: '1px solid var(--color-line)',
              borderRadius: 6,
              padding: '10px 12px',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 400,
              resize: 'vertical',
              background: 'var(--color-paper)',
              color: 'var(--color-ink)',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveBtn onClick={save} busy={busy}>
            Save changes
          </SaveBtn>
          {msg && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color:
                  msg === 'Profile saved'
                    ? 'var(--color-success)'
                    : 'var(--color-error)',
              }}
            >
              {msg}
            </span>
          )}
        </div>
      </div>

      <SettingRow
        title="Username"
        description="Your unique handle on IDEVRX."
        action={
          <span
            style={{
              color: 'var(--color-muted)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}
          >
            @{user.username}
          </span>
        }
      />
      <SettingRow
        title="Public profile link"
        description="Share this with others."
        action={
          <span
            style={{
              color: 'var(--color-muted)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}
          >
            /@{user.username}
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

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 10,
            color: 'var(--color-ink)',
          }}
        >
          Change password
        </div>
        <div style={{ marginBottom: 10 }}>
          <Input
            type="password"
            value={current}
            onChange={setCurrent}
            placeholder="Current password"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Input
            type="password"
            value={next}
            onChange={setNext}
            placeholder="New password (10+ chars, upper, lower, number)"
          />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveBtn onClick={changePassword} busy={busy}>
            Update password
          </SaveBtn>
          {msg && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: msg.includes('success')
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
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
        action={
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--color-muted)',
            }}
          >
            Not available yet
          </span>
        }
      />

      <div style={{ marginTop: 28 }}>
        <SectionHead title="Danger zone" />
        {deletion?.deletionPending ? (
          <div
            style={{
              padding: 18,
              border: '1px solid var(--color-error)',
              background: 'var(--color-error-bg)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--color-error)',
              }}
            >
              Account deletion scheduled
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-muted)',
                marginBottom: 14,
              }}
            >
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
            action={
              <SmallBtn onClick={requestDeletion} variant="danger">
                Delete
              </SmallBtn>
            }
          />
        )}
      </div>
    </div>
  );
}

function NotificationsTab() {
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
    setPrefs((p: any) => ({
      ...p,
      notifications: { ...p.notifications, [key]: value },
    }));
    await fetch(`${api()}/api/v1/profiles/me/preferences`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: { [key]: value } }),
    });
  }

  if (!prefs)
    return (
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
        Loading...
      </div>
    );

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

  if (!prefs)
    return (
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
        Loading...
      </div>
    );

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
          <Select
            value={prefs.playback.quality}
            onChange={(v) => update({ quality: v })}
            options={['Auto', '1080p', '720p', '480p', '360p']}
          />
        }
      />
      <SettingRow
        title="Playback speed"
        description="Your default speed."
        action={
          <Select
            value={prefs.playback.speed}
            onChange={(v) => update({ speed: v })}
            options={['0.5x', '1x', '1.25x', '1.5x', '2x']}
          />
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

  if (!prefs)
    return (
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
        Loading...
      </div>
    );

  const items: [string, string, string][] = [
    ['publicProfile', 'Public profile', 'Let anyone view your profile.'],
    ['showLikes', 'Show liked projects', 'Display your likes on your profile.'],
    ['showHistory', 'Show watch history', 'Let others see what you viewed.'],
    ['allowComments', 'Allow comments', 'Let people comment on your posts.'],
    [
      'personalisedRecommendations',
      'Personalised recommendations',
      'Use activity to suggest builds.',
    ],
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
  }

  if (!prefs)
    return (
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
        Loading...
      </div>
    );

  return (
    <div>
      <SectionHead title="Appearance and language" />
      <SettingRow
        title="Theme"
        description="IDEVRX currently uses a single editorial theme."
        action={
          <Select
            value={prefs.appearance.theme}
            onChange={(v) => update({ theme: v })}
            options={['System', 'Light', 'Dark']}
          />
        }
      />
      <SettingRow
        title="Language"
        description="Language used across IDEVRX."
        action={
          <Select
            value={prefs.appearance.language}
            onChange={(v) => update({ language: v })}
            options={['English', 'French', 'Yoruba', 'Hausa', 'Igbo']}
          />
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
        <div
          style={{
            marginTop: 16,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-success)',
          }}
        >
          {msg}
        </div>
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
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            marginBottom: 22,
            lineHeight: 1.6,
          }}
        >
          You have Creator access. Open Creator Studio to manage your projects.
        </p>
        <a
          href="/studio"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
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
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-muted)',
          marginBottom: 22,
          lineHeight: 1.6,
        }}
      >
        Publish build videos, posts, and project documentation. Only approved
        Creators can upload.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href="/creator/apply"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Apply to become a Creator
        </a>
        <a
          href="/creator-guidelines"
          style={{
            display: 'inline-block',
            padding: '11px 22px',
            background: 'var(--color-paper)',
            border: '1px solid var(--color-line-strong)',
            color: 'var(--color-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Read the Creator guide
        </a>
      </div>
    </div>
  );
}
