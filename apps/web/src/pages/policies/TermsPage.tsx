export function TermsPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Legal</div>
      <h1>Terms of Service</h1>

      <p>
        These terms describe the agreement between you and IDEVRX when you use
        the platform. This is a working draft and will be finalized before
        public launch.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>
          You are responsible for keeping your credentials secure.
        </li>
        <li>
          You are responsible for activity that occurs under your account.
        </li>
        <li>
          You must provide accurate information and keep it current.
        </li>
        <li>
          You must not impersonate another person or misrepresent your identity.
        </li>
      </ul>

      <h2>Your content</h2>
      <p>
        You retain ownership of the projects, files, and other content you
        publish on IDEVRX. By publishing, you grant IDEVRX the license required
        to store, display, and distribute that content as part of operating the
        platform.
      </p>
      <p>
        You are responsible for ensuring you have the right to publish what you
        upload. See the{' '}
        <a href="/policies/copyright" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          copyright policy
        </a>{' '}
        for details.
      </p>

      <h2>Platform rules</h2>
      <p>
        Your use of IDEVRX is subject to the{' '}
        <a href="/community-guidelines" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          community guidelines
        </a>{' '}
        and the{' '}
        <a href="/creator-guidelines" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          creator guidelines
        </a>
        . Content and accounts that violate these rules may be restricted or
        removed.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>
          Do not attempt to bypass authentication, authorization, or rate limits.
        </li>
        <li>Do not upload malware or intentionally harmful files.</li>
        <li>
          Do not scrape, overload, or interfere with the platform or its
          infrastructure.
        </li>
        <li>
          Do not use the platform for content that is illegal in your
          jurisdiction.
        </li>
      </ul>

      <h2>Engineering responsibility</h2>
      <p>
        IDEVRX does not guarantee that a circuit, design, component, machine,
        or code will work or be safe in every environment. Creators are
        responsible for the engineering work they publish. Builders are
        responsible for evaluating safety before reproducing any project.
      </p>

      <h2>Availability and changes</h2>
      <p>
        IDEVRX is under active development. Features may change, be added, or
        be removed. The platform may be unavailable during maintenance.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using IDEVRX at any time. You can request account deletion
        from settings. We may restrict or suspend accounts that violate these
        terms.
      </p>
    </div>
  );
}
