import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, finalize } from 'rxjs/operators';

let isRefreshing = false;
const refreshDone$ = new Subject<void>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const at = auth.getAccessToken();
  if (at) req = req.clone({ setHeaders: { Authorization: `Bearer ${at}` } });

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }

      const rt = auth.getRefreshToken();
      if (!rt) {
        auth.clear();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }

      if (isRefreshing) {
        return refreshDone$.pipe(
          take(1),
          switchMap(() => {
            const fresh = auth.getAccessToken();
            return next(fresh ? req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }) : req);
          })
        );
      }

      isRefreshing = true;
      return auth.refresh().pipe(
        switchMap(() => {
          refreshDone$.next();
          const fresh = auth.getAccessToken();
          return next(fresh ? req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }) : req);
        }),
        catchError(inner => {
          auth.clear();
          refreshDone$.next();
          router.navigate(['/auth/login']);
          return throwError(() => inner);
        }),
        finalize(() => { isRefreshing = false; })
      );
    })
  );
};