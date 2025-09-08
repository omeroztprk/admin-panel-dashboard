import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly K = {
    access: 'accessToken',
    refresh: 'refreshToken',
    user: 'currentUser'
  };

  private readonly userSig = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  currentUserSig = this.userSig;
  userFullName = computed(() => {
    const u = this.userSig();
    return u ? (u.fullName ?? `${u.firstName} ${u.lastName}`) : '';
  });

  constructor(private http: HttpClient) {
    this.restore();
    window.addEventListener('storage', e => {
      if (e.key === this.K.user) {
        if (!e.newValue) {
          this.userSig.set(null);
          this.isAuthenticated.set(false);
        } else {
          try {
            this.userSig.set(JSON.parse(e.newValue));
            if (this.token(this.K.access)) this.isAuthenticated.set(true);
          } catch {
            this.clear();
          }
        }
      }
      if (e.key === this.K.access && !e.newValue) {
        this.clear();
      }
    });
  }

  register(data: RegisterRequest): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<{ data: LoginResponse }> {
    return this.http.post<{ data: LoginResponse }>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        const r = res.data;
        if (r.accessToken && r.refreshToken && r.user) {
          this.applyAuth(r.user, r.accessToken, r.refreshToken);
        }
      })
    );
  }

  refresh(): Observable<{ data: { accessToken: string } }> {
    const rt = this.getRefreshToken();
    if (!rt) {
      this.clear();
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{ data: { accessToken: string } }>(`${this.apiUrl}/refresh`, { refreshToken: rt })
      .pipe(tap(res => this.setAccess(res.data.accessToken)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(tap(() => this.clear()));
  }

  logoutAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout-all`, {}).pipe(tap(() => this.clear()));
  }

  setCurrentUser(user: User): void {
    this.userSig.set(user);
    localStorage.setItem(this.K.user, JSON.stringify(user));
  }

  applyAuth(user: User, at: string, rt: string): void {
    localStorage.setItem(this.K.access, at);
    localStorage.setItem(this.K.refresh, rt);
    this.setCurrentUser(user);
    this.isAuthenticated.set(true);
  }

  clear(): void {
    localStorage.removeItem(this.K.access);
    localStorage.removeItem(this.K.refresh);
    localStorage.removeItem(this.K.user);
    this.userSig.set(null);
    this.isAuthenticated.set(false);
  }

  isAuth(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.userSig();
  }

  getAccessToken(): string | null {
    return this.token(this.K.access);
  }

  getRefreshToken(): string | null {
    return this.token(this.K.refresh);
  }

  getCurrentJti(): string | null {
    const t = this.getAccessToken();
    if (!t) return null;
    const decoded = this.decode(t);
    return decoded?.jti || null;
  }

  private token(key: string): string | null {
    return localStorage.getItem(key);
  }

  private setAccess(at: string) {
    localStorage.setItem(this.K.access, at);
  }

  private restore() {
    const rawUser = localStorage.getItem(this.K.user);
    if (rawUser) {
      try { this.userSig.set(JSON.parse(rawUser)); } catch { this.clear(); return; }
    }
    if (this.getAccessToken()) this.isAuthenticated.set(true);
  }

  private decode(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  }
}