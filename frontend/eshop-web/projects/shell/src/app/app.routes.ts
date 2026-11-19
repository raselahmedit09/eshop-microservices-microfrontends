import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { authGuard } from 'shared';

export const routes: Routes = [
  // Cart and orders belong to a customer, so they need a login; the catalog is public
  {
    path: 'cart',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule('mfe-basket', './routes').then(m => m.routes),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => loadRemoteModule('mfe-orders', './routes').then(m => m.routes),
  },
  // Catalog owns "/" and "/products", so it comes after the fixed paths
  {
    path: '',
    loadChildren: () => loadRemoteModule('mfe-catalog', './routes').then(m => m.routes),
  },
  { path: '**', redirectTo: '' },
];
