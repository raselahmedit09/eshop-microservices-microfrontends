import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BasketStore, ProductCard } from 'shared';
import { injectAllProducts } from '../catalog-data';

// Shopping.Web's ProductList. The filter is in the URL (?category=), so links and Back keep it.
@Component({
  selector: 'app-product-list',
  imports: [ProductCard, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  protected readonly basket = inject(BasketStore);
  private readonly all = injectAllProducts();

  protected readonly selected = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(q => q.get('category') ?? '')),
    { initialValue: '' },
  );
  protected readonly categories = computed(() => [...new Set(this.all().flatMap(p => p.category ?? []))].sort());
  protected readonly products = computed(() => {
    const category = this.selected();
    return category ? this.all().filter(p => (p.category ?? []).includes(category)) : this.all();
  });
}
