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
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          width: '100%',
          border: 0,
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, lineHeight: 1.35 }}>
          <b style={{ fontSize: 15, color: '#0F172A' }}>{title}</b>
          <small
            style={{
              display: 'block',
              color: '#64748B',
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
            color: '#64748B',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px' }}>{children}</div>
      )}
    </div>
  );
}
