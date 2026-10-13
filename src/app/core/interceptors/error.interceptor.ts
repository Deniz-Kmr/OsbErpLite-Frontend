import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return handle401(req, next, authService, router);
      }

      if (error.status === 403) {
        console.error('Bu islemi yapmaya yetkiniz yok');
      }

      if (error.status === 404) {
        console.error('Kayit bulunamadi');
      }

      if (error.status >= 500) {
        console.error('Beklenmeyen bir hata olustu');
      }

      return throwError(() => error);
    }),
  );
};

function handle401(
  req: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  router: Router,
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res) => {
        isRefreshing = false;
        const newToken = res.data?.token ?? '';
        refreshTokenSubject.next(newToken);
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) =>
      next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        }),
      ),
    ),
  );
}
