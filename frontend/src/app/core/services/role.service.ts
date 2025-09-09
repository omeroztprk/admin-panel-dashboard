import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';

export interface RoleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
export interface RoleListResponse {
  data: Role[];
  meta: RoleListMeta;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = `${environment.apiUrl}/roles`;
  constructor(private http: HttpClient) {}

  list(page = 1, limit = 50): Observable<RoleListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<RoleListResponse>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<{ data: Role }>(`${this.api}/${id}`);
  }
}