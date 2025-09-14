import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../models/customer.model';
import { ListResponse, DetailResponse } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = `${environment.apiUrl}/customers`;
  constructor(private http: HttpClient) { }

  list(page = 1, limit = 10): Observable<ListResponse<Customer>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ListResponse<Customer>>(this.api, { params });
  }

  getById(id: string): Observable<DetailResponse<Customer>> {
    return this.http.get<DetailResponse<Customer>>(`${this.api}/${id}`);
  }

  getBySlug(slug: string): Observable<{ data: Customer }> {
    return this.http.get<{ data: Customer }>(`${this.api}/slug/${encodeURIComponent(slug)}`);
  }

  create(data: CreateCustomerRequest): Observable<{ data: Customer }> {
    return this.http.post<{ data: Customer }>(this.api, data);
  }

  update(id: string, data: UpdateCustomerRequest): Observable<{ data: Customer }> {
    return this.http.patch<{ data: Customer }>(`${this.api}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}