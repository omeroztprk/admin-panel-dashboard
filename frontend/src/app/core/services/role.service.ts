import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../models/role.model';
import { ListResponse, DetailResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = `${environment.apiUrl}/roles`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 10): Observable<ListResponse<Role>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<Role>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<Role>> {
    return this.http.get<DetailResponse<Role>>(`${this.api}/${id}`);
  }

  create(data: CreateRoleRequest): Observable<{ data: Role }> {
    return this.http.post<{ data: Role }>(this.api, data);
  }

  update(id: string, data: UpdateRoleRequest): Observable<{ data: Role }> {
    return this.http.patch<{ data: Role }>(`${this.api}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}