import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';
import { ListResponse, DetailResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 10): Observable<ListResponse<Category>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<Category>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<Category>> {
    return this.http.get<DetailResponse<Category>>(`${this.api}/${id}`);
  }

  create(data: CreateCategoryRequest): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(this.api, data);
  }

  update(id: string, data: UpdateCategoryRequest): Observable<{ data: Category }> {
    return this.http.patch<{ data: Category }>(`${this.api}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  tree(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(`${this.api}/tree`);
  }
}