import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

export interface CategoryListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
export interface CategoryListResponse {
  data: Category[];
  meta: CategoryListMeta;
}
export interface CategoryDetailResponse {
  data: Category;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}

  list(page = 1, limit = 20): Observable<CategoryListResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<CategoryListResponse>(this.api, { params });
  }

  getById(id: string): Observable<CategoryDetailResponse> {
    return this.http.get<CategoryDetailResponse>(`${this.api}/${id}`);
  }

  create(data: Partial<Category>) {
    return this.http.post<{ data: Category }>(this.api, data);
  }

  update(id: string, data: Partial<Category>) {
    return this.http.patch<{ data: Category }>(`${this.api}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  tree(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(`${this.api}/tree`);
  }
}