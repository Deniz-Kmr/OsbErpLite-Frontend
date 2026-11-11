import { Routes } from '@angular/router';

export const PURCHASE_ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./purchase-order-list/purchase-order-list.component').then(
        (m) => m.PurchaseOrderListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./purchase-order-detail/purchase-order-detail.component').then(
        (m) => m.PurchaseOrderDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent,
      ),
  },
];
