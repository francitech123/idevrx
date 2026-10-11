import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ProjectAccordion({ title, subtitle, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          width: '100%',
          border: 0,
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, lineHeight: 1.35 }}>
          <b
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '-0.012em',
              color: 'var(--color-ink)',
              display: 'block',
            }}
          >
            {title}
          </b>
          <small
            style={{
              fontFamily: 'var(--font-sans)',
              display: 'block',
              color: 'var(--color-muted)',
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {subtitle}
          </small>
        </div>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--color-muted)',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            padding: '0 20px 20px',
            borderTop: '1px solid var(--color-line)',
            paddingTop: 18,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
