'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const DISMISS_KEY = 'ps.installPrompt.dismissedAt';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const t = useTranslations('install');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    if (isIos()) {
      setIos(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="border-b border-border-tertiary bg-bg-secondary px-3 py-2 flex items-center gap-2 text-[11px]"
      role="region"
      aria-label={t('title')}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{t('title')}</div>
        <div className="text-text-tertiary truncate">
          {ios ? t('bodyIos') : t('body')}
        </div>
      </div>
      {!ios && (
        <button
          type="button"
          onClick={install}
          className="bg-text-primary text-bg-primary rounded-sm px-2 py-1 min-h-[32px] min-w-[44px]"
        >
          {t('install')}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="rounded-sm px-2 py-1 min-h-[32px] min-w-[44px] border border-border-tertiary"
      >
        ✕
      </button>
    </div>
  );
}
