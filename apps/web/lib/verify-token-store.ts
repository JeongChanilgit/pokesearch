const KEY_PREFIX = 'pokesearch.verify-token.';

interface StoredToken {
  teamId: string;
  token: string;
  expiresAt: string;
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveVerifyToken(
  teamId: string,
  token: string,
  expiresAt: string,
): void {
  const s = storage();
  if (!s) return;
  const value: StoredToken = { teamId, token, expiresAt };
  try {
    s.setItem(`${KEY_PREFIX}${teamId}`, JSON.stringify(value));
  } catch {
    /* quota or privacy mode; ignore */
  }
}

export function readVerifyToken(teamId: string): StoredToken | null {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(`${KEY_PREFIX}${teamId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredToken;
    if (parsed.teamId !== teamId || !parsed.token || !parsed.expiresAt) {
      return null;
    }
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      clearVerifyToken(teamId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearVerifyToken(teamId: string): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(`${KEY_PREFIX}${teamId}`);
  } catch {
    /* ignore */
  }
}
