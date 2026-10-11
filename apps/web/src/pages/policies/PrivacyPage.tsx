export function PrivacyPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Legal</div>
      <h1>Privacy Policy</h1>

      <p>
        This page outlines how IDEVRX handles your data. It is a working draft
        and will be finalized before public launch.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Account data:</b> display name, username, email address, hashed
          password.
        </li>
        <li>
          <b>Content:</b> projects, files, comments, and other material you
          publish.
        </li>
        <li>
          <b>Session data:</b> authentication sessions and their creation
          metadata.
        </li>
        <li>
          <b>Usage:</b> requests to the API, kept for security, rate limiting,
          and auditability.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To authenticate you and keep you signed in.</li>
        <li>To display your public profile and content.</li>
        <li>To enforce platform rules and prevent abuse.</li>
        <li>To operate, maintain, and improve the platform.</li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell your personal data.</li>
        <li>We don't expose private account information through public APIs.</li>
        <li>We don't store plaintext passwords.</li>
      </ul>

      <h2>Your controls</h2>
      <p>
        From account settings you can update your profile, change your password,
        review your session information, request a data export, and schedule
        account deletion.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a single HttpOnly session cookie to keep you signed in. See the{' '}
        <a href="/policies/cookies" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          cookie policy
        </a>{' '}
        for details.
      </p>

      <h2>Third-party services</h2>
      <p>
        IDEVRX uses third-party services for hosting, database, object storage,
        and (where enabled) AI assistance. Each service processes only the data
        required for its function.
      </p>

      <h2>Changes</h2>
      <p>
        This policy may be updated as the platform evolves. Material changes
        will be reflected here.
      </p>
    </div>
  );
}
