import { Link } from 'react-router-dom';

const POLICIES = [
  { to: '/policies/privacy', label: 'Privacy Policy' },
  { to: '/policies/terms', label: 'Terms of Service' },
  { to: '/policies/cookies', label: 'Cookie Policy' },
  { to: '/policies/copyright', label: 'Copyright' },
  { to: '/policies/safety', label: 'Safety' },
  { to: '/policies/ai', label: 'AI Policy' },
  { to: '/policies/accessibility', label: 'Accessibility' },
];

export function PoliciesIndexPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Policies</div>
      <h1>Policies</h1>
      <ul>
        {POLICIES.map((p) => (
          <li key={p.to}>
            <Link to={p.to} style={{ color: 'var(--brand-primary)' }}>{p.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
