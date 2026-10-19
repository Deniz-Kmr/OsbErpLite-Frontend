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
import { UserRole, UserRoleLabel } from '@core/models/enums';
import { UserDto } from '@core/models/dto/user.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [open]="open()"
      [title]="modalTitle()"
      (closed)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Kullanıcı Adı"
          formControlName="username"
          placeholder="Kullanıcı adı girin"
          [error]="getError('username')"
        />

        @if (!editData()) {
          <app-input
            label="E-posta"
            type="email"
            formControlName="email"
            placeholder="E-posta adresi"
            [error]="getError('email')"
          />

          <app-input
            label="Şifre"
            type="password"
            formControlName="password"
            placeholder="Şifre girin"
            [error]="getError('password')"
          />
        }

        <app-select
          label="Rol"
          formControlName="role"
          [options]="roleOptions"
          [error]="getError('role')"
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
          Kaydet
        </app-button>
      </div>
    </app-modal>
  `,
})
export class UserFormComponent {
  open = input.required<boolean>();
  editData = input<UserDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);

  roleOptions: SelectOption[] = [
    { value: String(UserRole.Admin), label: UserRoleLabel[UserRole.Admin] },
    { value: String(UserRole.Manager), label: UserRoleLabel[UserRole.Manager] },
    { value: String(UserRole.Employee), label: UserRoleLabel[UserRole.Employee] },
  ];

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [String(UserRole.Employee), Validators.required],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          username: data.username,
          role: String(data.role),
        });
        this.form.get('email')?.clearValidators();
        this.form.get('password')?.clearValidators();
      } else {
        this.form.reset({ role: String(UserRole.Employee) });
        this.form.get('email')?.setValidators([Validators.required, Validators.email]);
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.form.get('email')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
      this.serverErrors.set({});
    });
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.username} Düzenle` : 'Yeni Kullanıcı';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('email')) return 'Geçerli bir e-posta girin';
    if (control.hasError('minlength')) return 'En az 6 karakter olmalıdır';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverErrors.set({});

    const formValue = this.form.getRawValue();
    const editData = this.editData();

    if (editData) {
      const payload = {
        role: Number(formValue.role) as UserRole,
        isActive: editData.isActive,
      };

      this.userService.update(editData.id, payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Kullanıcı güncellendi');
            this.saved.emit();
          } else {
            this.toastService.error(res.message ?? 'İşlem başarısız');
          }
        },
        error: (err) => this.handleError(err),
      });
    } else {
      const payload = {
        username: formValue.username,
        password: formValue.password,
        role: Number(formValue.role) as UserRole,
      };

      this.userService.create(payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Kullanıcı oluşturuldu');
            this.saved.emit();
          } else {
            this.toastService.error(res.message ?? 'İşlem başarısız');
          }
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(err: { status: number; error?: { errors?: Record<string, unknown>; message?: string } }): void {
    this.submitting.set(false);
    if (err.status === 400 && err.error?.errors) {
      const errors: Record<string, string> = {};
      for (const [key, value] of Object.entries(err.error.errors)) {
        const fieldKey = key.charAt(0).toLowerCase() + key.slice(1);
        errors[fieldKey] = Array.isArray(value) ? value[0] : String(value);
      }
      this.serverErrors.set(errors);
    } else {
      this.toastService.error(err.error?.message ?? 'Beklenmeyen bir hata oluştu');
    }
  }

  onClose(): void {
    this.form.reset({ role: String(UserRole.Employee) });
    this.serverErrors.set({});
    this.closed.emit();
  }
}
