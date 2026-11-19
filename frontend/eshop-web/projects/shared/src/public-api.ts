/*
 * Public API Surface of shared
 */

export * from './lib/shared';
export * from './lib/config';
export * from './lib/api/provide-api-clients';

// Generated clients (npm run generate:api), one namespace per service. The three specs share
// names such as ProblemDetails and Configuration, so a plain export * would collide (TS2308).
export * as CatalogClient from './lib/api/generated/catalog';
export * as BasketClient from './lib/api/generated/basket';
export * as OrderingClient from './lib/api/generated/ordering';
