interface Step {
  id: string;
  stepNumber: number;
  title: string;
  body: string;
  mediaFileIds: string[];
  warnings: string[];
}

export function StepList({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return (
      <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
        No build steps yet.
      </p>
    );
  }

  return (
    <ol
      style={{
        display: 'grid',
        gap: 12,
        padding: 0,
        margin: 0,
        listStyle: 'none',
        counterReset: 's',
      }}
    >
      {steps.map((s) => (
        <li
          key={s.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '34px 1fr',
            gap: 12,
            counterIncrement: 's',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {s.stepNumber}
          </span>
          <div>
            <b style={{ display: 'block', lineHeight: 1.3, fontSize: 15 }}>
              {s.title}
            </b>
            {s.body && (
              <span
                style={{
                  color: '#64748B',
                  fontSize: 14,
                  lineHeight: 1.6,
                  display: 'block',
                  marginTop: 4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {s.body}
              </span>
            )}
            {s.warnings.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#92400E',
                }}
              >
                {s.warnings.map((w, i) => (
                  <div key={i}>⚠ {w}</div>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
