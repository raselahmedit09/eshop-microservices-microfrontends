import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { adminGuard, authGuard } from 'shared';

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
  // authGuard first (login), then adminGuard (role)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => loadRemoteModule('mfe-admin', './routes').then(m => m.routes),
  },

  // Shell's own pages (Shopping.Web's Contact, Privacy, Confirmation)
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: 'privacy', loadComponent: () => import('./pages/privacy/privacy').then(m => m.Privacy) },
  { path: 'confirmation', loadComponent: () => import('./pages/confirmation/confirmation').then(m => m.Confirmation) },

  // Catalog owns "/", "/products" and "/products/:id", so it comes after the fixed paths.
  // Its own routes have no "**", so unknown paths fall through to the not-found page below.
  {
    path: '',
    loadChildren: () => loadRemoteModule('mfe-catalog', './routes').then(m => m.routes),
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
];
