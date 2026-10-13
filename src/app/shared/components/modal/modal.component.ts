import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        (keydown.escape)="onClose()"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-250 motion-reduce:transition-none"
          [class.opacity-100]="visible()"
          [class.opacity-0]="!visible()"
          (click)="onClose()"
        ></div>

        <!-- Panel -->
        <div
          class="relative w-full bg-[var(--bg-surface)] rounded-[1.25rem] shadow-[0_20px_25px_rgba(0,0,0,0.08),0_8px_10px_rgba(0,0,0,0.04)] transition-all duration-250 motion-reduce:transition-none"
          [class.scale-100]="visible()"
          [class.opacity-100]="visible()"
          [class.scale-95]="!visible()"
          [class.opacity-0]="!visible()"
          [style.max-width]="maxWidth()"
          [style.transition-timing-function]="'cubic-bezier(0.32, 0.72, 0, 1)'"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ title() }}</h3>
            <button
              type="button"
              class="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors duration-150 cursor-pointer"
              (click)="onClose()"
              aria-label="Kapat"
            >
              <i class="ph-light ph-x text-xl"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[var(--border)]">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  open = input.required<boolean>();
  title = input<string>('');
  maxWidth = input<string>('480px');

  closed = output<void>();

  visible = signal(false);

  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => this.visible.set(true));
      } else {
        this.visible.set(false);
        this.document.body.style.overflow = '';
      }
    });
  }

  onClose(): void {
    this.visible.set(false);
    setTimeout(() => this.closed.emit(), 150);
  }
}
