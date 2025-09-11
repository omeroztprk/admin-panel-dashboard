import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { SystemHealth } from '../models/health.model';

@Injectable({ providedIn: 'root' })
export class SystemHealthService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/health`;

  get(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(this.api).pipe(
      map(h => h)
    );
  }
}