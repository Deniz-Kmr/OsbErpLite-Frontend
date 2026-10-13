import { Component, inject, output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { UserRoleLabel } from '@core/models/enums';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/business-partners': 'İş Ortakları',
  '/products': 'Ürünler',
  '/warehouses': 'Depolar',
  '/stock-movements': 'Stok Hareketleri',
  '/purchase-orders': 'Satın Alma',
  '/sales-orders': 'Satış',
  '/departments': 'Departmanlar',
  '/positions': 'Pozisyonlar',
  '/employees': 'Çalışanlar',
  '/leave-requests': 'İzin Talepleri',
  '/admin': 'Yönetim',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  readonly toggleSidebar = output<void>();
  readonly themeService = inject(ThemeService);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.getCurrentUser();
  readonly userInitial = this.currentUser
    ? this.currentUser.username.charAt(0).toUpperCase()
    : '?';
  readonly roleLabel = this.currentUser
    ? UserRoleLabel[this.currentUser.role]
    : '';

  dropdownOpen = false;

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        const match = Object.keys(ROUTE_TITLES).find((key) =>
          url.startsWith(key),
        );
        return match ? ROUTE_TITLES[match] : 'Dashboard';
      }),
    ),
    { initialValue: 'Dashboard' },
  );

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
