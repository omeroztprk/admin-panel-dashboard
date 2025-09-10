import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, ProfileUpdateRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = `${environment.apiUrl}/profile`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  getProfile(): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(this.api)
      .pipe(tap(res => this.auth.setCurrentUser(res.data)));
  }

  updateProfile(payload: ProfileUpdateRequest): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(this.api, payload)
      .pipe(tap(res => this.auth.setCurrentUser(res.data)));
  }
}