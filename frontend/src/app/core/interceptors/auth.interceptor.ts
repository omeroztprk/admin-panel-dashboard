import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, finalize, take } from 'rxjs/operators';

let isRefreshing = false;
const refreshDone$ = new Subject<void>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          authService.clear();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        if (isRefreshing) {
          return refreshDone$.pipe(
            take(1),
            switchMap(() => next(addAuth(req, authService.getAccessToken())))
          );
        }

        isRefreshing = true;
        return authService.refresh().pipe(
          switchMap(() => {
            refreshDone$.next();
            return next(addAuth(req, authService.getAccessToken()));
          }),
          catchError(innerErr => {
            authService.clear();
            refreshDone$.next();
            router.navigate(['/auth/login']);
            return throwError(() => innerErr);
          }),
          finalize(() => { isRefreshing = false; })
        );
      }
      return throwError(() => error);
    })
  );
};

function addAuth(req: HttpRequest<any>, token: string | null) {
  return token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}