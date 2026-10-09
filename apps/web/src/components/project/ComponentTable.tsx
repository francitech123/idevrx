interface Component {
  id: string;
  name: string;
  quantity: string;
  specification: string;
  notes: string;
  optional: boolean;
  sourceUrl: string;
}

export function ComponentTable({ components }: { components: Component[] }) {
  if (components.length === 0) {
    return (
      <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
        No components listed.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: 480,
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Part</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Specification</th>
            <th style={thStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.id}>
              <td style={tdStyle}>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                {c.optional && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      padding: '2px 8px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      borderRadius: 99,
                      fontWeight: 500,
                    }}
                  >
                    optional
                  </span>
                )}
              </td>
              <td style={tdStyle}>{c.quantity}</td>
              <td style={tdStyle}>{c.specification || '—'}</td>
              <td style={tdStyle}>{c.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #E2E8F0',
  fontSize: 12,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #E2E8F0',
  fontSize: 14,
  verticalAlign: 'top',
};
