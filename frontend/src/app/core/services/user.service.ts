import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { ListResponse, DetailResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 10): Observable<ListResponse<User>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<User>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<User>> {
    return this.http.get<DetailResponse<User>>(`${this.api}/${id}`);
  }

  create(data: CreateUserRequest): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(this.api, data);
  }

  update(id: string, data: UpdateUserRequest): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(`${this.api}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}