/*
 * Public API Surface of shared
 */

export * from './lib/shared';
export * from './lib/config';
export * from './lib/api/provide-api-clients';
export * from './lib/auth/oidc.config';
export * from './lib/auth/auth.service';
export * from './lib/auth/guards';
export * from './lib/state/notification.store';
export * from './lib/state/basket.store';
export * from './lib/orders/order-status';
export * from './lib/ui/product-card/product-card';
export * from './lib/ui/product-image';

// Generated clients (npm run generate:api), one namespace per service. The three specs share
// names such as ProblemDetails and Configuration, so a plain export * would collide (TS2308).
export * as CatalogClient from './lib/api/generated/catalog';
export * as BasketClient from './lib/api/generated/basket';
export * as OrderingClient from './lib/api/generated/ordering';
