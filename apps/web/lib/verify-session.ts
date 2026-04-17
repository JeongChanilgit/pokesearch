const STORAGE_KEY_PREFIX = 'pokesearch.verifyToken.';

interface StoredToken {
  teamId: string;
  token: string;
  expiresAt: string;
}

function key(teamId: string): string {
  return `${STORAGE_KEY_PREFIX}${teamId}`;
}

export function saveVerifyToken(
  teamId: string,
  token: string,
  expiresAt: string,
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredToken = { teamId, token, expiresAt };
    window.sessionStorage.setItem(key(teamId), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadVerifyToken(teamId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key(teamId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredToken>;
    if (!parsed?.token || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.sessionStorage.removeItem(key(teamId));
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

export function clearVerifyToken(teamId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key(teamId));
  } catch {
    /* ignore */
  }
}
