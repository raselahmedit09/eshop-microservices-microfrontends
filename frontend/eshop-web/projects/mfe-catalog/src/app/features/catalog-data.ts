import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CatalogClient } from 'shared';

// All products as a signal, shared by Home and Products. Like Shopping.Web they are loaded once
// and filtered in the browser; with many products use getProductByCategory on the server instead.
// Must be called in an injection context (a field initializer or constructor).
export function injectAllProducts() {
  return toSignal(
    inject(CatalogClient.ProductsService)
      .getProducts(1, 100)
      .pipe(
        map(r => r.products ?? []),
        catchError(() => of([] as CatalogClient.Product[])), // errorInterceptor already showed a message
      ),
    { initialValue: [] as CatalogClient.Product[] },
  );
}
