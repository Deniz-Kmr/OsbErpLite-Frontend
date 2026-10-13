import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [open]="open()" [title]="title()" (closed)="cancel.emit()">
      <p class="text-sm text-[var(--text-secondary)]">{{ message() }}</p>

      <div modal-footer class="flex items-center justify-end gap-3">
        <app-button variant="secondary" (clicked)="cancel.emit()">İptal</app-button>
        <app-button [variant]="confirmVariant()" (clicked)="confirm.emit()">
          {{ confirmLabel() }}
        </app-button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  open = input.required<boolean>();
  title = input<string>('Onay');
  message = input<string>('Bu işlemi onaylıyor musunuz?');
  confirmLabel = input<string>('Onayla');
  confirmVariant = input<ButtonVariant>('destructive');

  confirm = output<void>();
  cancel = output<void>();
}
