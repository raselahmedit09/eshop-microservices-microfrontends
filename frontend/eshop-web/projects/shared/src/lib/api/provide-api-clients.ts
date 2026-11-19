import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_BASE } from '../config';
import * as BasketClient from './generated/basket';
import * as CatalogClient from './generated/catalog';
import * as OrderingClient from './generated/ordering';

// The specs describe each service's own paths (/products), but the browser calls the gateway
// (/catalog-service/products), so every client's base path is the gateway plus the route prefix.
export function provideApiClients(): EnvironmentProviders {
  return makeEnvironmentProviders([
    CatalogClient.provideApi(`${API_BASE}/catalog-service`),
    BasketClient.provideApi(`${API_BASE}/basket-service`),
    OrderingClient.provideApi(`${API_BASE}/ordering-service`),
  ]);
}
