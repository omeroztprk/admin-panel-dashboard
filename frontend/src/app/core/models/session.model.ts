export interface Session {
  _id: string;
  user: string;
  jti: string;
  token?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
}
