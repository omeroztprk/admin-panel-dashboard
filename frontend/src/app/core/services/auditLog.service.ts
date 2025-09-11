import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/auditLog.model';
import { ListResponse, DetailResponse } from '../models/api.types';

export interface AuditLogListFilters {
  user?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failure';
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = `${environment.apiUrl}/audit-logs`;
  constructor(private http: HttpClient) {}

  list(page = 1, limit = 20, filters: AuditLogListFilters = {}): Observable<ListResponse<AuditLog>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ListResponse<AuditLog>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<AuditLog>> {
    return this.http.get<DetailResponse<AuditLog>>(`${this.api}/${id}`);
  }
}