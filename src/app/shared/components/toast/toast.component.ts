import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-surface)] shadow-[0_10px_15px_rgba(0,0,0,0.06),0_4px_6px_rgba(0,0,0,0.04)] border-l-[3px] min-w-[320px] max-w-[420px] animate-[slideIn_300ms_cubic-bezier(0.32,0.72,0,1)_forwards] motion-reduce:animate-none"
          [style.border-left-color]="borderColor(toast.type)"
        >
          <i [class]="iconClass(toast.type)" [style.color]="borderColor(toast.type)"></i>
          <span class="flex-1 text-sm text-[var(--text-primary)]">{{ toast.message }}</span>
          <button
            type="button"
            class="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
            (click)="toastService.remove(toast.id)"
            aria-label="Kapat"
          >
            <i class="ph-light ph-x text-sm"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);

  borderColor(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'var(--success)',
      error: 'var(--destructive)',
      info: 'var(--info)',
      warning: 'var(--warning)',
    };
    return map[type];
  }

  iconClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'ph-light ph-check-circle text-xl',
      error: 'ph-light ph-warning text-xl',
      info: 'ph-light ph-info text-xl',
      warning: 'ph-light ph-warning-circle text-xl',
    };
    return map[type];
  }
}
