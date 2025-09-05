import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  tfaRequired?: boolean;
  tfaId?: string;
}

export interface TfaVerifyRequest {
  tfaId: string;
  code: string;
}

export interface TfaVerifyResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
