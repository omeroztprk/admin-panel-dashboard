import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../models/permission.model';
import { ListResponse, DetailResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = `${environment.apiUrl}/permissions`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 10): Observable<ListResponse<Permission>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<Permission>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<Permission>> {
    return this.http.get<DetailResponse<Permission>>(`${this.api}/${id}`);
  }

  create(data: CreatePermissionRequest): Observable<{ data: Permission }> {
    return this.http.post<{ data: Permission }>(this.api, data);
  }

  update(id: string, data: UpdatePermissionRequest): Observable<{ data: Permission }> {
    return this.http.patch<{ data: Permission }>(`${this.api}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}