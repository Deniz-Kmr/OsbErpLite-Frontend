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

import { PositionService } from '../position.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { PositionDto } from '@core/models/dto/position.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-position-form',
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
      [title]="modalTitle()"
      (closed)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Pozisyon Adı"
          formControlName="title"
          placeholder="Pozisyon adını girin"
          [error]="getError('title')"
        />

        <app-input
          label="Seviye"
          formControlName="level"
          type="number"
          placeholder="Seviye girin"
          [error]="getError('level')"
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
export class PositionFormComponent {
  open = input.required<boolean>();
  editData = input<PositionDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly positionService = inject(PositionService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    level: [1, [Validators.required, Validators.min(1)]],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          title: data.title,
          level: data.level,
        });
      } else {
        this.form.reset({ title: '', level: 1 });
      }
      this.serverErrors.set({});
    });
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.title} Düzenle` : 'Yeni Pozisyon';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('min')) return 'Seviye en az 1 olmalıdır';
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
    const payload = {
      title: formValue.title,
      level: Number(formValue.level),
    };

    const editData = this.editData();
    const request$ = editData
      ? this.positionService.update(editData.id, payload)
      : this.positionService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success(
            editData ? 'Pozisyon güncellendi' : 'Pozisyon oluşturuldu',
          );
          this.saved.emit();
        } else {
          this.toastService.error(res.message ?? 'İşlem başarısız');
        }
      },
      error: (err) => {
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
      },
    });
  }

  onClose(): void {
    this.form.reset({ title: '', level: 1 });
    this.serverErrors.set({});
    this.closed.emit();
  }
}
