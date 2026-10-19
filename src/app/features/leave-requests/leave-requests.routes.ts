import { Routes } from '@angular/router';

export const LEAVE_REQUEST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./leave-request-list/leave-request-list.component').then(
        (m) => m.LeaveRequestListComponent,
      ),
  },
];
