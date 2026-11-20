import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/".
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'products', loadComponent: () => import('./features/product-list/product-list').then(m => m.ProductList) },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail),
  },
];
