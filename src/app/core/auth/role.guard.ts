import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { UserRole } from '@core/models/enums';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const roles = route.data['roles'] as UserRole[] | undefined;
  if (!roles || authService.hasRole(roles)) {
    return true;
  }

  console.error('Bu islemi yapmaya yetkiniz yok');
  router.navigate(['/dashboard']);
  return false;
};
