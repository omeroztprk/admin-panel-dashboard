export interface Session {
  _id: string;
  user: string;
  jti?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string | Date;
  expiresAt: string | Date;
  revokedAt?: string | Date | null;
}
