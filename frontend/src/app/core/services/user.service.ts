import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface ListResponse<T> {
  data: T[];
  meta: ListMeta;
}

export interface DetailResponse<T> { data: T; }

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  list(page = 1, limit = 20): Observable<ListResponse<User>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ListResponse<User>>(this.api, { params });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getById(id: string) {
    return this.http.get<DetailResponse<User>>(`${this.api}/${id}`);
  }

  create(data: CreateUserRequest) {
    return this.http.post<{ data: User }>(this.api, data);
  }

  update(id: string, data: UpdateUserRequest) {
    return this.http.patch<{ data: User }>(`${this.api}/${id}`, data);
  }
}