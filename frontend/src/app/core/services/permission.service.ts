import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Permission } from '../models/permission.model';

export interface PermissionListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
export interface PermissionListResponse {
  data: Permission[];
  meta: PermissionListMeta;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = `${environment.apiUrl}/permissions`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 100): Observable<PermissionListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PermissionListResponse>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<{ data: Permission }>(`${this.api}/${id}`);
  }
}