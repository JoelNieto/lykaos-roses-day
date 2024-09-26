import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./order.component').then((m) => m.OrderComponent),
  },
  {
    path: 'receipt/:orderId',
    loadComponent: () =>
      import('./receipt.component').then((m) => m.ReceiptComponent),
  },
  {
    path: 'orders-list',
    loadComponent: () =>
      import('./orders-list.component').then((m) => m.OrdersListComponent),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
