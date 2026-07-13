import { createClient, OAuthStrategy } from '@wix/sdk';
import {
  services,
  availabilityCalendar,
  availabilityTimeSlots,
  attributeDefinition,
  attributeValue,
  bookings,
  extendedBookings,
} from '@wix/bookings';
import { members } from '@wix/members';
import { checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';

const TOKENS_KEY = 'wix-rentals:session';
// Headless OAuth Client ID (a public, non-secret value) read from the env at
// build time. Set PUBLIC_WIX_CLIENT_ID in your .env — see .env.example.
const CLIENT_ID = (import.meta.env.PUBLIC_WIX_CLIENT_ID ?? '').trim();

export const isClientConfigured = CLIENT_ID.length > 0;

/** Tokens are persisted so the same visitor session survives reloads + the
 *  round-trip through Wix-hosted checkout. Structurally compatible with the
 *  SDK's Tokens type. */
type StoredTokens = Parameters<typeof OAuthStrategy>[0]['tokens'];

function loadTokens(): StoredTokens | undefined {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : undefined;
  } catch {
    return undefined;
  }
}

function saveTokens(tokens: StoredTokens): void {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

if (!isClientConfigured && typeof console !== 'undefined') {
  console.error(
    '[wix-rentals] Missing PUBLIC_WIX_CLIENT_ID. Set it in .env to your ' +
      'Headless OAuth Client ID (see .env.example).',
  );
}

export const wixClient = createClient({
  modules: {
    services,
    availabilityCalendar,
    availabilityTimeSlots,
    attributeDefinition,
    attributeValue,
    bookings,
    extendedBookings,
    members,
    checkout,
    redirects,
  },
  auth: OAuthStrategy({
    clientId: CLIENT_ID,
    tokens: loadTokens(),
  }),
});

function clearTokens(): void {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch {
    /* ignore */
  }
}

let sessionPromise: Promise<void> | null = null;

/** Ensure a valid session exists and is persisted. If a member is already logged
 *  in, their session is kept as-is; otherwise an anonymous visitor session is
 *  generated. Safe to call repeatedly — the work runs once per page load. */
export function ensureVisitorSession(): Promise<void> {
  if (!isClientConfigured) return Promise.resolve();
  // Don't overwrite a logged-in member session with anonymous visitor tokens.
  if (wixClient.auth.loggedIn()) return Promise.resolve();
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const tokens = await wixClient.auth.generateVisitorTokens(loadTokens());
      saveTokens(tokens);
    })().catch((err) => {
      // Reset so a later call can retry after a transient failure.
      sessionPromise = null;
      throw err;
    });
  }
  return sessionPromise;
}

/* ------------------------------------------------------------------ Members
   Wix Headless member login uses the OAuth "managed login" redirect flow. */

const OAUTH_KEY = 'wix-rentals:oauth';

export function isLoggedIn(): boolean {
  return isClientConfigured && wixClient.auth.loggedIn();
}

/** Redirect the browser to the Wix-hosted login page. On success Wix redirects
 *  back to `/login-callback`, which must be whitelisted in the Headless OAuth
 *  app settings. `returnTo` is where the user lands after logging in. */
export async function login(returnTo = '/account'): Promise<void> {
  const redirectUri = `${window.location.origin}/login-callback`;
  const origin = `${window.location.origin}${returnTo}`;
  const oauthData = wixClient.auth.generateOAuthData(redirectUri, origin);
  sessionStorage.setItem(OAUTH_KEY, JSON.stringify(oauthData));
  const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, { prompt: 'login' });
  window.location.href = authUrl;
}

/** Exchange the OAuth callback for member tokens and persist them. Returns the
 *  path to send the user back to. Call this on the `/login-callback` route. */
export async function completeLogin(): Promise<string> {
  const raw = sessionStorage.getItem(OAUTH_KEY);
  if (!raw) throw new Error('Your login session expired. Please try signing in again.');
  const oauthData = JSON.parse(raw);
  const { code, state, error, errorDescription } = wixClient.auth.parseFromUrl();
  if (error) throw new Error(errorDescription || error);
  const tokens = await wixClient.auth.getMemberTokens(code, state, oauthData);
  wixClient.auth.setTokens(tokens);
  saveTokens(tokens);
  sessionStorage.removeItem(OAUTH_KEY);
  // generateOAuthData stored our returnTo in `originalUri` — resolve it to a path.
  try {
    return new URL(oauthData.originalUri).pathname || '/account';
  } catch {
    return '/account';
  }
}

/** Log the member out (clears the session and redirects through Wix's logout). */
export async function logout(): Promise<void> {
  const { logoutUrl } = await wixClient.auth.logout(window.location.origin);
  clearTokens();
  sessionPromise = null;
  window.location.href = logoutUrl;
}

/** The currently logged-in member's profile, or null. */
export async function getCurrentMember(): Promise<{
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
} | null> {
  if (!isLoggedIn()) return null;
  // FULL fieldset: PUBLIC omits loginEmail + contact, so the name/email would
  // otherwise be missing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await (wixClient as any).members.getCurrentMember({ fieldsets: ['FULL'] });
  const m = res?.member ?? res;
  if (!m) return null;
  return {
    id: m._id ?? m.id,
    name: m.profile?.nickname || m.contact?.firstName || m.loginEmail || 'Member',
    email: m.loginEmail,
    photo: m.profile?.photo?.url,
  };
}
