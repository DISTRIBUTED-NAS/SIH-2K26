export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'LMO_OFFICER' | string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
