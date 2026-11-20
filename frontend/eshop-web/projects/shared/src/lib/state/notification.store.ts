import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export interface Toast {
  id: number;
  kind: 'success' | 'error';
  text: string;
}

// Short messages shown by the shell (top right). Any app can push one, as the store is a singleton.
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(kind: Toast['kind'], text: string): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}

// Shows one readable message for every failed API call
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationStore);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // GET basket returns 404 when the user has no basket yet; BasketStore treats it as empty
        const noBasketYet = err.status === 404 && req.method === 'GET' && req.url.includes('/basket-service/basket');
        if (!noBasketYet) {
          notify.error(messageFor(err));
        }
      }
      return throwError(() => err);
    }),
  );
};

function messageFor(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Cannot reach the server. Check that the gateway is running.';
  if (err.status === 401) return 'Your session expired. Please log in again.';
  if (err.status === 403) return 'You do not have permission to do that.';
  if (err.status === 429) return 'Too many requests. Wait a few seconds and try again.';
  // CustomExceptionHandler returns ProblemDetails with title and detail
  const problem = err.error as { detail?: string; title?: string } | null;
  return problem?.detail ?? problem?.title ?? `Request failed (${err.status}).`;
}
