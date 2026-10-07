import { useEffect } from 'react';
import { useCookieConsent } from './CookieConsentContext';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    // Guard: no consent, no ID, or consent denies analytics → do nothing
    if (!consent?.analytics) return;
    if (!GA_MEASUREMENT_ID) return;

    // Avoid double-injection if this effect runs twice (React StrictMode)
    if (document.getElementById('ga-script')) return;

    // 1. Inject gtag.js
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Init dataLayer and configure
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true, // GDPR-friendly
    });
  }, [consent?.analytics]);

  return null;
}
