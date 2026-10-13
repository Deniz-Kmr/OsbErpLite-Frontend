import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  warning(message: string): void {
    this.add('warning', message);
  }

  remove(id: number): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  private add(type: ToastType, message: string): void {
    const id = this.nextId++;
    this.toasts.update((t) => {
      const updated = [...t, { id, type, message }];
      return updated.slice(-3);
    });
    setTimeout(() => this.remove(id), 4000);
  }
}
