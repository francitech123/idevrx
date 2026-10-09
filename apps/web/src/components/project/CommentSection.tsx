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
      style={{
        marginTop: 28,
        paddingTop: 24,
        borderTop: '1px solid #E2E8F0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Discussion</h2>
        <span style={{ color: '#64748B', fontSize: 13 }}>
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
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
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 99,
            padding: '10px 16px',
            fontFamily: 'inherit',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={post}
          disabled={busy || !body.trim()}
          aria-label="Post
