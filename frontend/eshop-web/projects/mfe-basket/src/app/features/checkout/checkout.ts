import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, BasketClient, BasketStore } from 'shared';

// Shopping.Web's Checkout: address and payment form on the left, cart summary on the right.
// userName and customerId are not sent: Basket.API takes both from the token (sub).
@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  protected readonly store = inject(BasketStore);
  private readonly api = inject(BasketClient.BasketService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly busy = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    // The email claim from the id token (Keycloak asks for it at registration)
    emailAddress: [this.auth.email(), [Validators.required, Validators.email]],
    addressLine: ['', Validators.required],
    country: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{12,19}$/)]],
    expiration: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
    paymentMethod: [1],
  });

  constructor() {
    if (this.store.items().length === 0) {
      this.store.load();
    }
  }

  // Show a field's error only after the user has left it
  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    const dto: BasketClient.BasketCheckoutDto = { ...this.form.getRawValue(), totalPrice: this.store.total() };
    this.api.checkoutBasket({ basketCheckoutDto: dto }).subscribe({
      next: () => {
        this.store.clear();
        this.router.navigate(['/confirmation'], { queryParams: { type: 'order' } });
      },
      // errorInterceptor already showed the message
      error: () => this.busy.set(false),
    });
  }
}
