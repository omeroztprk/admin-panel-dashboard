import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session } from '../models/session.model';

export interface SessionsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface SessionResponse {
  data: Session[];
  meta: SessionsMeta;
}

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  list(page: number, limit: number): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  remove(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}`);
  }

  removeAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
