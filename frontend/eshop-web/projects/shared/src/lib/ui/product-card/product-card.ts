import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as CatalogClient from '../../api/generated/catalog';
import { productImage, useFallbackImage } from '../product-image';

// Shopping.Web's _ProductItemPartial
@Component({
  selector: 'eshop-product-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<CatalogClient.Product>();
  readonly addToCart = output<CatalogClient.Product>();

  protected readonly image = computed(() => productImage(this.product()));
  protected readonly fallback = useFallbackImage;
}
