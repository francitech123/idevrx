import { useState } from 'react';
import { Copy, Download, X, Eye } from 'lucide-react';

interface Props {
  open: boolean;
  filename: string;
  code: string;
  onClose: () => void;
}

export function CodeDialog({ open, filename, code, onClose }: Props) {
  const [revealed, setRevealed] = useState(false);

  if (!open) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  }

  function download() {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.[^.]+$/, '') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 100%)',
          maxHeight: '86vh',
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px 14px 12px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: '#0F172A',
            }}
          >
            {filename}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copy}
              aria-label="Copy code"
              style={iconBtnStyle}
            >
              <Copy size={15} />
            </button>
            <button
              onClick={download}
              aria-label="Download code"
              style={iconBtnStyle}
            >
              <Download size={15} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              style={iconBtnStyle}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div
          onClick={() => !revealed && setRevealed(true)}
          style={{
            position: 'relative',
            margin: 16,
            borderRadius: 12,
            background: '#0E1B24',
            color: '#D6E2EE',
            overflow: 'hidden',
            cursor: revealed ? 'default' : 'pointer',
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: 18,
              overflow: 'auto',
              maxHeight: revealed ? '60vh' : '9.5em',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85em',
              lineHeight: 1.7,
              WebkitMaskImage: revealed
                ? undefined
                : 'linear-gradient(#000 35%, transparent)',
              maskImage: revealed
                ? undefined
                : 'linear-gradient(#000 35%, transparent)',
            }}
          >
            {code}
          </pre>

          {!revealed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRevealed(true);
              }}
              aria-label="Reveal full code"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 14,
                transform: 'translateX(-50%)',
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: '#fff',
                color: '#0E1B24',
                border: 0,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Eye size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  padding: 0,
  borderRadius: '50%',
  border: '1px solid #E2E8F0',
  background: '#fff',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  color: '#0F172A',
};
