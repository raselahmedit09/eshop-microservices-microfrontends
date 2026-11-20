import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BasketStore, ProductCard } from 'shared';
import { injectAllProducts } from '../catalog-data';

// Shopping.Web's Index: rotating banner, "Last products" (first 4) and "Best products" (last 4)
@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, ProductCard, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly basket = inject(BasketStore);
  private readonly products = injectAllProducts();

  protected readonly latest = computed(() => this.products().slice(0, 4));
  protected readonly best = computed(() => this.products().slice(-4));

  protected readonly banners = ['/images/banner/banner1.png', '/images/banner/banner2.png', '/images/banner/banner3.png'];
  protected readonly current = signal(0);

  constructor() {
    const timer = setInterval(() => this.move(1), 5000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  move(step: number): void {
    this.current.update(i => (i + step + this.banners.length) % this.banners.length);
  }
}
