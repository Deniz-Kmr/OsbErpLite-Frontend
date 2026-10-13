import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <i class="ph-light ph-spinner-gap animate-spin" [class]="iconSizeClass()"></i>
      } @else {
        @if (icon()) {
          <i [class]="'ph-light ph-' + icon() + ' ' + iconSizeClass()"></i>
        }
        <ng-content />
      }
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  icon = input<string>('');

  clicked = output<MouseEvent>();

  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold text-sm transition-colors cursor-pointer';
    const reduced = 'motion-reduce:transition-none';

    const sizeMap: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-[0.625rem]',
      md: 'h-10 px-4 text-sm rounded-[0.625rem]',
      lg: 'h-12 px-6 text-base rounded-[0.625rem]',
    };

    const variantMap: Record<ButtonVariant, string> = {
      primary:
        'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
      secondary:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
      destructive:
        'bg-[var(--destructive)] text-white hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-[var(--destructive)] focus-visible:ring-offset-2',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      outline:
        'bg-transparent text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
    };

    const disabledClass =
      this.disabled() || this.loading() ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return `${base} ${reduced} ${sizeMap[this.size()]} ${variantMap[this.variant()]} ${disabledClass}`.trim();
  }

  iconSizeClass(): string {
    const map: Record<ButtonSize, string> = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return map[this.size()];
  }
}
