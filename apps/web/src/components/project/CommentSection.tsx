import { useState } from 'react';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string } | null;
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function CommentSection({
  projectId,
  comments,
  onCommentPosted,
}: {
  projectId: string;
  comments: Comment[];
  onCommentPosted: (c: Comment) => void;
}) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  async function post() {
    if (!body.trim()) return;
    setBusy(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/projects/${projectId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        const b = await res.json();
        if (b.success) {
          onCommentPosted(b.data.comment);
          setBody('');
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
  id="comments"
  style={{
    marginTop: 32,
    paddingTop: 28,
    borderTop: '1px solid var(--color-line)',
  }}
>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            color: 'var(--color-ink)',
          }}
        >
          Discussion
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 13,
          }}
        >
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Ask a question or share an idea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              post();
            }
          }}
          style={{
            flex: 1,
            background: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            borderRadius: 999,
            padding: '12px 18px',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-ink)',
            outline: 'none',
          }}
        />
        <button
          onClick={post}
          disabled={busy || !body.trim()}
          aria-label="Post comment"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 0,
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            display: 'grid',
            placeItems: 'center',
            cursor: busy ? 'wait' : 'pointer',
            opacity: !body.trim() ? 0.4 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {comments.length === 0 && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 13,
            marginTop: 16,
          }}
        >
          No comments yet. Be the first.
        </p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            display: 'flex',
            gap: 12,
            padding: '14px 0',
            borderTop: '1px solid var(--color-line)',
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {c.author ? initials(c.author.displayName) : '?'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 4 }}>
              <b
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                }}
              >
                {c.author?.displayName ?? 'Unknown'}
              </b>{' '}
              <small
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-muted)',
                  fontSize: 12,
                }}
              >
                {timeAgo(c.createdAt)}
              </small>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 14.5,
                color: 'var(--color-ink-subtle)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {c.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
