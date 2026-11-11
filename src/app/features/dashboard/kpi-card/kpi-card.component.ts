import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  OnInit,
  DestroyRef,
  inject,
  ElementRef,
  viewChild,
} from '@angular/core';
import { DecimalPipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-outer group">
      <div class="kpi-inner">
        <div class="flex items-start justify-between">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl
                   bg-[var(--primary-soft)]"
          >
            <i
              class="ph-light text-[22px] text-[var(--primary)]"
              [class]="'ph-light ph-' + icon()"
              [attr.aria-hidden]="true"
            ></i>
          </div>
          @if (trend() !== null && trend() !== undefined) {
            <div
              class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              [class]="trend()! >= 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'"
            >
              <i
                class="ph-light text-sm"
                [class]="trend()! >= 0 ? 'ph-light ph-arrow-up' : 'ph-light ph-arrow-down'"
                [attr.aria-hidden]="true"
              ></i>
              <span class="font-mono text-xs">
                {{ trend()! >= 0 ? '+' : '' }}{{ trend() }}%
              </span>
            </div>
          }
        </div>
        <div class="mt-3">
          <p
            #valueEl
            class="font-mono text-[28px] font-bold leading-tight text-[var(--text-primary)]"
          >
            @if (format() === 'currency') {
              {{ displayValue() | currency: '₺' : 'symbol' : '1.0-0' }}
            } @else {
              {{ displayValue() | number: '1.0-0' }}
            }
          </p>
          <p class="mt-1 text-[13px] font-medium text-[var(--text-secondary)]">
            {{ title() }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .kpi-outer {
      padding: 6px;
      border-radius: 1.25rem;
      background: rgba(0, 0, 0, 0.03);
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
      transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1),
                  box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    :host-context(.dark) .kpi-outer {
      background: rgba(255, 255, 255, 0.05);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    }

    .kpi-outer:hover {
      transform: translateY(-2px);
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04),
                  0 4px 6px rgba(0, 0, 0, 0.04),
                  0 2px 4px rgba(0, 0, 0, 0.06);
    }

    :host-context(.dark) .kpi-outer:hover {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06),
                  0 4px 6px rgba(0, 0, 0, 0.2),
                  0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .kpi-inner {
      padding: 1.25rem;
      border-radius: 1rem;
      background: var(--bg-surface);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
    }

    @media (prefers-reduced-motion: reduce) {
      .kpi-outer { transition: none; }
    }
  `,
})
export class KpiCardComponent implements OnInit {
  readonly title = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input<string>('chart-bar');
  readonly trend = input<number | null>(null);
  readonly format = input<'number' | 'currency'>('number');

  readonly displayValue = signal(0);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.animateCount();
  }

  private animateCount(): void {
    const target = this.value();
    if (target === 0) {
      this.displayValue.set(0);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      this.displayValue.set(target);
      return;
    }

    const duration = 600;
    const start = performance.now();
    let rafId: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue.set(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(rafId));
  }
}
