import { Link } from 'react-router-dom';
import { useCookieConsent } from './CookieConsentContext';
import { useState, useEffect } from 'react';

export function CookieConsentBanner() {
  const { hasDecided, accept, reject } = useCookieConsent();
  const [visible, setVisible] = useState(false);

  // Slight delay so it slides in smoothly, and doesn't fight the initial page paint
  useEffect(() => {
    if (hasDecided) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [hasDecided]);

  if (hasDecided || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="idx-cookie-banner"
    >
      <div className="idx-cookie-inner">
        <div className="idx-cookie-text">
          <p className="idx-cookie-title">We use cookies</p>
          <p className="idx-cookie-body">
            We use essential cookies to run IDEVRX, and optional cookies for
            analytics to improve the platform.{' '}
            <Link to="/policies/privacy" className="idx-cookie-link">
              Read our Privacy Policy →
            </Link>
          </p>
        </div>
        <div className="idx-cookie-actions">
          <button
            type="button"
            className="idx-cookie-btn idx-cookie-btn-outline"
            onClick={reject}
          >
            Reject
          </button>
          <button
            type="button"
            className="idx-cookie-btn idx-cookie-btn-primary"
            onClick={accept}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
