import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly userKey = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public readonly isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    const raw = localStorage.getItem(this.userKey);
    if (raw) {
      try {
        this.currentUserSubject.next(JSON.parse(raw));
      } catch {
        this.clear();
        return;
      }
    }
    if (token) {
      this.isAuthenticated.set(true);
    }
  }

  register(data: RegisterRequest): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<{ data: LoginResponse }> {
    return this.http.post<{ data: LoginResponse }>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          const result = response.data;
          if (result.accessToken && result.refreshToken && result.user) {
            this.applyAuth(result.user, result.accessToken, result.refreshToken);
          }
        })
      );
  }

  refresh(): Observable<{ data: { accessToken: string } }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clear();
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{ data: { accessToken: string } }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setAccessToken(response.data.accessToken);
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.clear()));
  }

  logoutAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout-all`, {})
      .pipe(tap(() => this.clear()));
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  public clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  public applyAuth(user: User, accessToken: string, refreshToken: string): void {
    this.setTokens(accessToken, refreshToken);
    this.setCurrentUser(user);
    this.isAuthenticated.set(true);
  }

  public isAuth(): boolean {
    return this.isAuthenticated();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}