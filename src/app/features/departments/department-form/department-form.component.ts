import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DepartmentService } from '../department.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { DepartmentDto } from '@core/models/dto/department.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-department-form',
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
          label="Departman Adı"
          formControlName="name"
          placeholder="Departman adını girin"
          [error]="getError('name')"
        />

        <app-select
          label="Yönetici"
          formControlName="managerId"
          placeholder="Yönetici seçin"
          [options]="employeeOptions()"
          [error]="getError('managerId')"
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
export class DepartmentFormComponent implements OnInit {
  open = input.required<boolean>();
  editData = input<DepartmentDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);
  employeeOptions = signal<SelectOption[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    managerId: [''],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          name: data.name,
          managerId: data.managerId ?? '',
        });
      } else {
        this.form.reset();
      }
      this.serverErrors.set({});
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.name} Düzenle` : 'Yeni Departman';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
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
      name: formValue.name,
      managerId: formValue.managerId || undefined,
    };

    const editData = this.editData();
    const request$ = editData
      ? this.departmentService.update(editData.id, payload)
      : this.departmentService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success(
            editData ? 'Departman güncellendi' : 'Departman oluşturuldu',
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
    this.form.reset();
    this.serverErrors.set({});
    this.closed.emit();
  }

  private loadEmployees(): void {
    this.departmentService.getEmployees().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employeeOptions.set(
            res.data.items.map((e) => ({
              value: e.id,
              label: e.fullName,
            })),
          );
        }
      },
    });
  }
}
