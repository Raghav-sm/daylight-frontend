export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  csrfToken: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationCredentials = LoginCredentials & {
  name: string;
};

export type ProfileUpdate = {
  name: string;
};

export type GoogleAuthStatus = {
  configured: boolean;
  linked: boolean;
  linkedEmail: string | null;
  hasPassword: boolean;
  canUnlink: boolean;
};

export type GoogleLinkStartResponse = {
  authorizationUrl: string;
};

export type ConnectedApp = {
  id: string;
  name: string;
  scopes: string[];
  createdAt: string;
};
