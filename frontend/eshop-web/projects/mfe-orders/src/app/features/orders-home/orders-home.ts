import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-orders-home',
  template: `<h1>Orders remote loaded</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersHome {}
