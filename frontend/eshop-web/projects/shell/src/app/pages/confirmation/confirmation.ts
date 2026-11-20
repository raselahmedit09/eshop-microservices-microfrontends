import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

// Shopping.Web's Confirmation: ?type=order after checkout, ?type=contact after the contact form
@Component({
  selector: 'app-confirmation',
  imports: [RouterLink],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confirmation {
  protected readonly type = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(q => q.get('type') ?? 'order')),
    { initialValue: 'order' },
  );
}
