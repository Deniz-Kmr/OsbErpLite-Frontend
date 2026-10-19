import { Component, inject, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { UserRole, UserRoleLabel } from '@core/models/enums';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'chart-pie-slice' },
  { label: 'İş Ortakları', route: '/business-partners', icon: 'users' },
  { label: 'Ürünler', route: '/products', icon: 'package' },
  { label: 'Depolar', route: '/warehouses', icon: 'warehouse' },
  { label: 'Stok Hareketleri', route: '/stock-movements', icon: 'arrows-left-right' },
  { label: 'Satın Alma', route: '/purchase-orders', icon: 'shopping-cart' },
  { label: 'Satış', route: '/sales-orders', icon: 'storefront' },
  { label: 'Departmanlar', route: '/departments', icon: 'buildings' },
  { label: 'Pozisyonlar', route: '/positions', icon: 'identification-badge' },
  { label: 'Çalışanlar', route: '/employees', icon: 'user-list' },
  { label: 'İzin Talepleri', route: '/leave-requests', icon: 'calendar' },
  { label: 'Kullanıcılar', route: '/admin/users', icon: 'users-three', roles: [UserRole.Admin] },
  { label: 'SAP Senkronizasyon', route: '/admin/sap', icon: 'arrows-clockwise', roles: [UserRole.Admin] },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly isOpen = input(false);
  readonly closeSidebar = output<void>();

  readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.getCurrentUser();
  readonly roleLabel = this.currentUser
    ? UserRoleLabel[this.currentUser.role]
    : '';

  readonly visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || this.authService.hasRole(item.roles),
  );

  onNavClick(): void {
    if (window.innerWidth < 768) {
      this.closeSidebar.emit();
    }
  }
}
