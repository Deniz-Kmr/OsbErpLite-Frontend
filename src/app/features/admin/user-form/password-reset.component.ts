import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../user.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserDto } from '@core/models/dto/user.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    InputComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [open]="open()"
      [title]="user() ? user()!.username + ' — Şifre Sıfırla' : 'Şifre Sıfırla'"
      (closed)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Yeni Şifre"
          type="password"
          formControlName="newPassword"
          placeholder="Yeni şifre girin"
          [error]="getError('newPassword')"
        />

        <app-input
          label="Şifre Tekrar"
          type="password"
          formControlName="confirmPassword"
          placeholder="Yeni şifreyi tekrar girin"
          [error]="getError('confirmPassword')"
        />
      </form>

      <div modal-footer class="flex items-center justify-end gap-3">
        <app-button variant="secondary" (clicked)="onClose()">İptal</app-button>
        <app-button
          variant="primary"
          [loading]="submitting()"
          [disabled]="form.invalid"
          (clicked)="onSubmit()"
        >
          Şifreyi Sıfırla
        </app-button>
      </div>
    </app-modal>
  `,
})
export class PasswordResetComponent {
  open = input.required<boolean>();
  user = input<UserDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.form.reset();
      }
    });
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('minlength')) return 'En az 6 karakter olmalıdır';

    if (field === 'confirmPassword') {
      const pw = this.form.get('newPassword')?.value;
      if (pw && control.value !== pw) return 'Şifreler eşleşmiyor';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.toastService.error('Şifreler eşleşmiyor');
      return;
    }

    const userData = this.user();
    if (!userData) return;

    this.submitting.set(true);

    this.userService.resetPassword(userData.id, { newPassword }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success(`${userData.username} şifresi sıfırlandı`);
          this.saved.emit();
        } else {
          this.toastService.error(res.message ?? 'İşlem başarısız');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastService.error(err.error?.message ?? 'Şifre sıfırlama başarısız');
      },
    });
  }

  onClose(): void {
    this.form.reset();
    this.closed.emit();
  }
}
