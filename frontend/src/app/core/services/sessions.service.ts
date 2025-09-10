import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session } from '../models/session.model';
import { ListResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly apiUrl = `${environment.apiUrl}/sessions`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 20): Observable<ListResponse<Session>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<Session>>(this.apiUrl, { params });
  }

  remove(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}`);
  }

  removeAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
