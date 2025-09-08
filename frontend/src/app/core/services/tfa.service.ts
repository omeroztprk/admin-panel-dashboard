import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TfaVerifyRequest, TfaVerifyResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TfaService {
  private readonly apiUrl = `${environment.apiUrl}/auth/tfa`;
  constructor(private http: HttpClient, private auth: AuthService) { }

  verify(data: TfaVerifyRequest): Observable<{ data: TfaVerifyResponse }> {
    return this.http.post<{ data: TfaVerifyResponse }>(`${this.apiUrl}/verify`, data)
      .pipe(tap(res => {
        const r = res.data;
        this.auth.applyAuth(r.user, r.accessToken, r.refreshToken);
      }));
  }
}