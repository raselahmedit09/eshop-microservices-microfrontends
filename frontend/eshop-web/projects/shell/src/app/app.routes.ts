import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cart',
    loadChildren: () => loadRemoteModule('mfe-basket', './routes').then(m => m.routes),
  },
  {
    path: 'orders',
    loadChildren: () => loadRemoteModule('mfe-orders', './routes').then(m => m.routes),
  },
  // Catalog owns "/" and "/products", so it comes after the fixed paths
  {
    path: '',
    loadChildren: () => loadRemoteModule('mfe-catalog', './routes').then(m => m.routes),
  },
  { path: '**', redirectTo: '' },
];
