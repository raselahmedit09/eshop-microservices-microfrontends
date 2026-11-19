import { Routes } from '@angular/router';

// Exposed as './routes' (federation.config.js). The shell mounts these under "/".
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/catalog-home/catalog-home').then(m => m.CatalogHome),
  },
];
