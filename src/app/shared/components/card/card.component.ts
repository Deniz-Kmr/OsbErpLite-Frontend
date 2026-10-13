import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type CardVariant = 'standard' | 'bezel';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'bezel') {
      <div
        class="p-1.5 rounded-[1.25rem] bg-black/[0.03] dark:bg-white/[0.05] ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
        [class.group]="hover()"
      >
        <div
          class="rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          [class]="innerPaddingClass()"
          [class.transition-transform]="hover()"
          [class.duration-200]="hover()"
          [class.group-hover:-translate-y-0.5]="hover()"
          [class.group-hover:shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]]="hover()"
          [class.motion-reduce:transition-none]="hover()"
        >
          <ng-content />
        </div>
      </div>
    } @else {
      <div
        class="rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
        [class]="innerPaddingClass()"
        [class.transition-transform]="hover()"
        [class.duration-200]="hover()"
        [class.hover:-translate-y-0.5]="hover()"
        [class.hover:shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]]="hover()"
        [class.motion-reduce:transition-none]="hover()"
      >
        <ng-content />
      </div>
    }
  `,
})
export class CardComponent {
  variant = input<CardVariant>('standard');
  padding = input<string>('p-5');
  hover = input<boolean>(false);

  innerPaddingClass(): string {
    return this.padding();
  }
}
