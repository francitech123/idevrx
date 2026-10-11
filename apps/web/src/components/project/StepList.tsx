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
      <p
        style={{
          color: 'var(--color-muted)',
          fontSize: 14,
          margin: 0,
          fontFamily: 'var(--font-sans)',
        }}
      >
        No build steps yet.
      </p>
    );
  }

  return (
    <ol
      style={{
        display: 'grid',
        gap: 14,
        padding: 0,
        margin: 0,
        listStyle: 'none',
      }}
    >
      {steps.map((s) => (
        <li
          key={s.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '34px 1fr',
            gap: 12,
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {s.stepNumber}
          </span>
          <div>
            <b
              style={{
                fontFamily: 'var(--font-display)',
                display: 'block',
                lineHeight: 1.3,
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.012em',
                color: 'var(--color-ink)',
              }}
            >
              {s.title}
            </b>
            {s.body && (
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-ink-subtle)',
                  fontSize: 14,
                  lineHeight: 1.65,
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
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning)',
                  borderRadius: 6,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--color-warning)',
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
