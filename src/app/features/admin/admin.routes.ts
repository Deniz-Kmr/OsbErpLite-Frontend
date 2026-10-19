import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-list/user-list.component').then(
        (m) => m.UserListComponent,
      ),
  },
  {
    path: 'sap',
    loadComponent: () =>
      import('./sap-sync/sap-sync.component').then(
        (m) => m.SapSyncComponent,
      ),
  },
];
