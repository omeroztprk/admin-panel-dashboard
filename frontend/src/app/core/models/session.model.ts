export interface Session {
  _id: string;
  user: string;
  jti?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt: string;
  revokedAt?: string | null;
}
