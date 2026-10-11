export function CookiesPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Legal</div>
      <h1>Cookie Policy</h1>

      <p>
        IDEVRX uses a small number of cookies for authentication and security.
        We do not use advertising or tracking cookies.
      </p>

      <h2>The cookie we use</h2>
      <p>
        When you sign in, IDEVRX sets a single session cookie. Its purpose is
        to identify your session on the server so you stay signed in as you
        navigate.
      </p>
      <ul>
        <li>
          <b>Name:</b> <code>idevrx_session</code> (or{' '}
          <code>__Host-idevrx_session</code> in production)
        </li>
        <li>
          <b>Purpose:</b> authentication
        </li>
        <li>
          <b>Type:</b> HttpOnly — the cookie is not accessible to JavaScript
        </li>
        <li>
          <b>SameSite:</b> Lax or None, depending on deployment architecture
        </li>
        <li>
          <b>Secure:</b> yes, in production
        </li>
        <li>
          <b>Lifetime:</b> seven days, refreshed on activity
        </li>
      </ul>

      <h2>No third-party cookies</h2>
      <p>
        IDEVRX does not set advertising or analytics cookies. Embedded
        YouTube videos may set their own cookies if you play them, governed by
        YouTube's own policies.
      </p>

      <h2>How to control cookies</h2>
      <p>
        You can block or delete cookies through your browser settings. Note
        that blocking the session cookie will prevent you from staying signed
        in.
      </p>

      <h2>Related policies</h2>
      <p>
        See the{' '}
        <a href="/policies/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
          privacy policy
        </a>{' '}
        for how we handle data more broadly.
      </p>
    </div>
  );
}
