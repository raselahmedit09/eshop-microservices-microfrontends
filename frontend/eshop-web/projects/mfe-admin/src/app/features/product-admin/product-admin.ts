import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CatalogClient, NotificationStore } from 'shared';

type Product = CatalogClient.Product;

// Create, edit and delete products. The shell's adminGuard only hides this page;
// Catalog.API's Admin policy is what actually protects POST/PUT/DELETE.
@Component({
  selector: 'app-product-admin',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAdmin {
  private readonly api = inject(CatalogClient.ProductsService);
  private readonly notify = inject(NotificationStore);

  protected readonly products = signal<Product[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly confirmingDelete = signal<string | null>(null);
  protected readonly busy = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    imageFile: ['placeholder.png', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.reload();
  }

  edit(p: Product): void {
    this.editingId.set(p.id ?? null);
    this.form.setValue({
      name: p.name ?? '',
      category: (p.category ?? []).join(', '),
      description: p.description ?? '',
      imageFile: p.imageFile ?? '',
      price: p.price ?? 0,
    });
  }

  reset(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body = { ...value, category: value.category.split(',').map(c => c.trim()).filter(Boolean) };
    const id = this.editingId();
    // Create and update return different response types; only success matters here
    const request: Observable<unknown> = id ? this.api.updateProduct({ id, ...body }) : this.api.createProduct(body);

    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.notify.success(id ? 'Product updated.' : 'Product created.');
        this.busy.set(false);
        this.reset();
        this.reload();
      },
      error: () => this.busy.set(false), // errorInterceptor already showed the message
    });
  }

  remove(p: Product): void {
    this.confirmingDelete.set(null);
    this.api.deleteProduct(p.id ?? '').subscribe({
      next: () => {
        this.notify.success(`${p.name} deleted.`);
        if (this.editingId() === p.id) {
          this.reset();
        }
        this.reload();
      },
      error: () => undefined,
    });
  }

  private reload(): void {
    this.api.getProducts(1, 100).subscribe({
      next: r => this.products.set(r.products ?? []),
      error: () => undefined,
    });
  }
}
