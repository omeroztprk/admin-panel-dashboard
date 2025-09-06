import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Session } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  list(page = 1, limit = 20): Observable<{
    data: Session[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    return this.http.get<{ data: Session[]; meta: any }>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      map(res => ({
        data: res.data,
        pagination: {
          page: res.meta.page,
          limit: res.meta.limit,
          total: res.meta.total,
          pages: res.meta.totalPages,
          hasNextPage: res.meta.hasNextPage,
          hasPrevPage: res.meta.hasPrevPage
        }
      }))
    );
  }

  remove(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}`);
  }

  removeAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}