import { getApiBaseUrl, request, setCsrfToken } from '@/lib/api-client';
import type {
  AuthResponse,
  GoogleAuthStatus,
  GoogleLinkStartResponse,
  ConnectedApp,
  LoginCredentials,
  ProfileUpdate,
  RegistrationCredentials,
} from '@/features/auth/types';

const GOOGLE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  account_exists: 'An account with this email already exists. Sign in with your password, then link Google in Account.',
  already_linked: 'That Google account is already linked to another Daylight account.',
  user_already_linked: 'Your Daylight account is already linked to a Google account.',
  cancelled: 'Google sign-in was cancelled.',
  expired: 'Your Google sign-in attempt expired. Please try again.',
  google_not_configured: 'Google sign-in is not configured on the backend yet.',
  invalid_state: 'Your Google sign-in session could not be verified. Please try again.',
  invalid_token: 'Google sign-in could not be verified. Please try again.',
  unverified_email: 'Your Google account email must be verified before signing in.',
  email_required: 'Google did not return an email address for this account.',
  session_mismatch: 'Please sign in to Daylight again before linking your Google account.',
  exchange_failed: 'Could not complete sign-in with Google. Please try again.',
  provider_error: 'Could not reach Google to complete sign-in. Please try again.',
};

export function getGoogleAuthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return GOOGLE_AUTH_ERROR_MESSAGES[code] ?? 'Google sign-in could not be completed. Please try again.';
}

export const authApi = {
  async register(credentials: RegistrationCredentials) {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: credentials,
    });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async login(credentials: LoginCredentials) {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async me(signal?: AbortSignal) {
    const response = await request<AuthResponse>('/auth/me', { signal });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async updateProfile(changes: ProfileUpdate) {
    const response = await request<AuthResponse>('/auth/me', {
      method: 'PATCH',
      body: changes,
    });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async logout() {
    await request<void>('/auth/logout', { method: 'POST' });
    setCsrfToken(null);
  },

  googleStartUrl(originPage: 'login' | 'register', returnTo = '/dashboard', oauthContinue?: string | null) {
    const params = new URLSearchParams({
      origin_page: originPage,
      return_to: returnTo,
    });
    if (oauthContinue) params.set('oauth_continue', oauthContinue);
    return `${getApiBaseUrl()}/auth/google/start?${params.toString()}`;
  },

  googleStatus(signal?: AbortSignal) {
    return request<GoogleAuthStatus>('/auth/google/status', { signal });
  },

  startGoogleLink() {
    return request<GoogleLinkStartResponse>('/auth/google/link/start', {
      method: 'POST',
    });
  },

  unlinkGoogle() {
    return request<void>('/auth/google/link', {
      method: 'DELETE',
    });
  },

  connectedApps(signal?: AbortSignal) {
    return request<ConnectedApp[]>('/auth/connected-apps', { signal });
  },

  disconnectApp(id: string) {
    return request<void>(`/auth/connected-apps/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
