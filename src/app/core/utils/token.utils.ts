/**
 * Helpers for inspecting the access token kept in localStorage.
 *
 * LoginComponent.setUserData writes it as JSON.stringify(resetToken) — a quoted
 * string — so every read has to go through JSON.parse before the value can be
 * treated as a JWT.
 */

/** Clock-skew allowance, so a token seconds away from expiring isn't treated as usable. */
const EXPIRY_LEEWAY_SECONDS = 30;

/** Unwraps the stored representation and returns the raw JWT, or null if there isn't one. */
export function readStoredToken(raw: string | null): string | null {
  if (!raw || raw === '{}' || raw === 'null') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
  } catch {
    // Tolerate values written without JSON.stringify by older builds.
    return raw;
  }
}

/**
 * True when the stored token is absent, structurally unusable, or past its `exp`.
 *
 * A token with no readable `exp` claim reports false — we can't prove it's dead,
 * so the server gets to decide and TokenInterceptor's 401 handler is the backstop.
 * Only tokens we can positively rule out are reported as expired here.
 */
export function isStoredTokenExpired(raw: string | null): boolean {
  const token = readStoredToken(raw);
  if (!token) {
    return true;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return true;
  }

  let payload: any;
  try {
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return true;
  }

  const exp = payload?.exp;
  if (typeof exp !== 'number') {
    return false;
  }

  return Date.now() / 1000 >= exp - EXPIRY_LEEWAY_SECONDS;
}

/**
 * Drops the stored session, keeping the chosen language.
 *
 * The language is deliberately carried across: wiping it sends Arabic users back
 * to an English UI every time their session lapses.
 */
export function clearStoredSession(): void {
  const lang = localStorage.getItem('lang');

  localStorage.clear();
  sessionStorage.clear();

  if (lang) {
    localStorage.setItem('lang', lang);
  }
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + '='.repeat(padding));

  // Rebuild the UTF-8 payload; atob alone mangles any non-ASCII claim value.
  return decodeURIComponent(
    binary
      .split('')
      .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}
