export interface ConsentState {
  essential: true;       // always true — cannot be disabled
  analytics: boolean;
  version: number;       // bump if consent policy changes
  timestamp: string;     // ISO date
}

const COOKIE_NAME = 'idevrx_consent';
const COOKIE_MAX_AGE_DAYS = 180; // 6 months
const CURRENT_VERSION = 1;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function getConsent(): ConsentState | null {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    essential: true,
    analytics,
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  writeCookie(COOKIE_NAME, JSON.stringify(state), COOKIE_MAX_AGE_DAYS);

  // Dispatch a custom event so other listeners (e.g. GA loader) react
  window.dispatchEvent(new CustomEvent('idevrx:consent-changed', { detail: state }));

  return state;
}

export function clearConsent() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/;`;
}
