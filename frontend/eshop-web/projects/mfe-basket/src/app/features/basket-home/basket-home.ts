import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-basket-home',
  template: `<h1>Basket remote loaded</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasketHome {}
