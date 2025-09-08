import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, ProfileUpdateRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profile`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  getProfile(): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(this.apiUrl)
      .pipe(tap(res => this.auth.setCurrentUser(res.data)));
  }

  updateProfile(payload: ProfileUpdateRequest): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(this.apiUrl, payload)
      .pipe(tap(res => this.auth.setCurrentUser(res.data)));
  }
}