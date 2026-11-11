import { Routes } from '@angular/router';

export const BUSINESS_PARTNER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./business-partner-list/business-partner-list.component').then(
        (m) => m.BusinessPartnerListComponent,
      ),
  },
];
