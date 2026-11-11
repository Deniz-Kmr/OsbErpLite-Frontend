import { HttpInterceptorFn } from '@angular/common/http';

const AUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh-token'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (AUTH_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
