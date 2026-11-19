import { request, setCsrfToken } from '@/lib/api-client';
import type {
  AuthResponse,
  LoginCredentials,
  ProfileUpdate,
  RegistrationCredentials,
} from '@/features/auth/types';

export const authApi = {
  async register(credentials: RegistrationCredentials) {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async login(credentials: LoginCredentials) {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
      body: JSON.stringify(changes),
    });
    setCsrfToken(response.csrfToken);
    return response;
  },

  async logout() {
    await request<void>('/auth/logout', { method: 'POST' });
    setCsrfToken(null);
  },
};
