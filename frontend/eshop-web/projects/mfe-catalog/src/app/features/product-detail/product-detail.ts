import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { BasketStore, CatalogClient, productImage, useFallbackImage } from 'shared';

// Shopping.Web's ProductDetail: colour, quantity +/-, add to cart, description
@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  protected readonly basket = inject(BasketStore);
  private readonly api = inject(CatalogClient.ProductsService);

  protected readonly notFound = signal(false);
  protected readonly product = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => params.get('id') ?? ''),
      switchMap(id =>
        this.api.getProductById(id).pipe(
          map(r => r.product),
          catchError(() => {
            this.notFound.set(true);
            return of(undefined);
          }),
        ),
      ),
    ),
  );

  protected readonly colors = ['Black', 'Blue', 'Red', 'Green'];
  protected readonly color = signal('Black');
  protected readonly quantity = signal(1);

  protected readonly image = productImage;
  protected readonly fallback = useFallbackImage;

  pickColor(event: Event): void {
    this.color.set((event.target as HTMLSelectElement).value);
  }

  changeQuantity(step: number): void {
    this.quantity.update(q => Math.max(1, q + step));
  }
}
