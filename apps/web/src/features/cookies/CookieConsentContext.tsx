import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getConsent, setConsent, type ConsentState } from './consent';

interface ConsentContextValue {
  consent: ConsentState | null;
  hasDecided: boolean;
  accept: () => void;
  reject: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsentState(getConsent());
    setHydrated(true);

    function onChange(e: Event) {
      const detail = (e as CustomEvent<ConsentState>).detail;
      setConsentState(detail);
    }
    window.addEventListener('idevrx:consent-changed', onChange);
    return () => window.removeEventListener('idevrx:consent-changed', onChange);
  }, []);

  function accept() {
    setConsentState(setConsent(true));
  }

  function reject() {
    setConsentState(setConsent(false));
  }

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasDecided: hydrated && consent !== null,
        accept,
        reject,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  }
  return ctx;
}
