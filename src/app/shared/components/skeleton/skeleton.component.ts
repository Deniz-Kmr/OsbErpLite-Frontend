import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type SkeletonVariant = 'line' | 'card' | 'table-row';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (_ of items; track $index) {
      @switch (variant()) {
        @case ('line') {
          <div class="h-4 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite] mb-3"
               [style.width]="lineWidth($index)">
          </div>
        }
        @case ('card') {
          <div class="rounded-2xl bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite] h-32 mb-4"></div>
        }
        @case ('table-row') {
          <div class="flex items-center gap-4 py-3 border-t border-[var(--border)]">
            <div class="h-4 flex-1 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite]"></div>
            <div class="h-4 w-24 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite]"></div>
            <div class="h-4 w-16 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite]"></div>
          </div>
        }
      }
    }
  `,
  styles: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    :host [class*="animate-[shimmer"] {
      background: linear-gradient(90deg, var(--bg-muted) 25%, var(--bg-subtle) 50%, var(--bg-muted) 75%);
      background-size: 200% 100%;
    }
    @media (prefers-reduced-motion: reduce) {
      :host [class*="animate-[shimmer"] {
        animation: none;
      }
    }
  `,
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  count = input<number>(3);

  get items(): number[] {
    return Array(this.count());
  }

  lineWidth(index: number): string {
    const widths = ['100%', '85%', '70%', '90%', '60%'];
    return widths[index % widths.length];
  }
}
