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
