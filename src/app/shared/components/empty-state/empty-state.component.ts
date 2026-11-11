import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-12 gap-3">
      @if (icon()) {
        <i [class]="'ph-light ph-' + icon() + ' text-4xl text-[var(--text-muted)]'"></i>
      }
      <p class="text-sm text-[var(--text-muted)] text-center">{{ message() }}</p>
      @if (actionLabel()) {
        <app-button variant="primary" size="sm" (clicked)="action.emit()">
          {{ actionLabel() }}
        </app-button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<string>('');
  message = input<string>('Kayıt bulunamadı');
  actionLabel = input<string>('');

  action = output<void>();
}
