import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { authGuard } from '@core/auth/auth.guard';
import { roleGuard } from '@core/auth/role.guard';
import { UserRole } from '@core/models/enums';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'business-partners',
        loadChildren: () =>
          import('./features/business-partners/business-partners.routes').then(
            (m) => m.BUSINESS_PARTNER_ROUTES,
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(
            (m) => m.PRODUCT_ROUTES,
          ),
      },
      {
        path: 'warehouses',
        loadChildren: () =>
          import('./features/warehouses/warehouses.routes').then(
            (m) => m.WAREHOUSE_ROUTES,
          ),
      },
      {
        path: 'stock-movements',
        loadChildren: () =>
          import('./features/stock-movements/stock-movements.routes').then(
            (m) => m.STOCK_MOVEMENT_ROUTES,
          ),
      },
      {
        path: 'purchase-orders',
        loadChildren: () =>
          import('./features/purchase-orders/purchase-orders.routes').then(
            (m) => m.PURCHASE_ORDER_ROUTES,
          ),
      },
      {
        path: 'sales-orders',
        loadChildren: () =>
          import('./features/sales-orders/sales-orders.routes').then(
            (m) => m.SALES_ORDER_ROUTES,
          ),
      },
      {
        path: 'departments',
        loadChildren: () =>
          import('./features/departments/departments.routes').then(
            (m) => m.DEPARTMENT_ROUTES,
          ),
      },
      {
        path: 'positions',
        loadChildren: () =>
          import('./features/positions/positions.routes').then(
            (m) => m.POSITION_ROUTES,
          ),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then(
            (m) => m.EMPLOYEE_ROUTES,
          ),
      },
      {
        path: 'leave-requests',
        loadChildren: () =>
          import('./features/leave-requests/leave-requests.routes').then(
            (m) => m.LEAVE_REQUEST_ROUTES,
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin] },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
