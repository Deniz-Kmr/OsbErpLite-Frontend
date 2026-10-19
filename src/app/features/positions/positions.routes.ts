import { Routes } from '@angular/router';

export const POSITION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./position-list/position-list.component').then(
        (m) => m.PositionListComponent,
      ),
  },
];
