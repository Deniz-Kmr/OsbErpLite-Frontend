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

import { EmployeeService } from '../employee.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { DepartmentService } from '@features/departments/department.service';
import { PositionService } from '@features/positions/position.service';
import { EmployeeStatus, EmployeeStatusLabel } from '@core/models/enums';
import { EmployeeDto } from '@core/models/dto/employee.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-employee-form',
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
          label="Ad Soyad"
          formControlName="fullName"
          placeholder="Ad ve soyad girin"
          [error]="getError('fullName')"
        />

        <app-input
          label="TC Kimlik No"
          formControlName="nationalId"
          placeholder="11 haneli TC Kimlik No"
          [error]="getError('nationalId')"
        />

        <app-select
          label="Departman"
          formControlName="departmentId"
          placeholder="Departman seçin"
          [options]="departmentOptions()"
          [error]="getError('departmentId')"
        />

        <app-select
          label="Pozisyon"
          formControlName="positionId"
          placeholder="Pozisyon seçin"
          [options]="positionOptions()"
          [error]="getError('positionId')"
        />

        <app-select
          label="Yönetici"
          formControlName="managerId"
          placeholder="Yönetici seçin (opsiyonel)"
          [options]="managerOptions()"
          [error]="getError('managerId')"
        />

        <app-input
          label="Maaş"
          type="number"
          formControlName="salary"
          placeholder="Maaş tutarı"
          [error]="getError('salary')"
        />

        <app-input
          label="İşe Başlama Tarihi"
          type="date"
          formControlName="hireDate"
          [error]="getError('hireDate')"
        />

        @if (editData()) {
          <app-select
            label="Durum"
            formControlName="status"
            [options]="statusOptions"
            [error]="getError('status')"
          />
        }
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
export class EmployeeFormComponent implements OnInit {
  open = input.required<boolean>();
  editData = input<EmployeeDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);
  departmentOptions = signal<SelectOption[]>([]);
  positionOptions = signal<SelectOption[]>([]);
  managerOptions = signal<SelectOption[]>([]);

  statusOptions: SelectOption[] = [
    { value: String(EmployeeStatus.Active), label: EmployeeStatusLabel[EmployeeStatus.Active] },
    { value: String(EmployeeStatus.OnLeave), label: EmployeeStatusLabel[EmployeeStatus.OnLeave] },
    { value: String(EmployeeStatus.Terminated), label: EmployeeStatusLabel[EmployeeStatus.Terminated] },
  ];

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    nationalId: ['', Validators.required],
    departmentId: ['', Validators.required],
    positionId: ['', Validators.required],
    managerId: [''],
    salary: [0, [Validators.required, Validators.min(0)]],
    hireDate: ['', Validators.required],
    status: [String(EmployeeStatus.Active)],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          fullName: data.fullName,
          nationalId: data.nationalId,
          departmentId: data.departmentId,
          positionId: data.positionId,
          managerId: data.managerId ?? '',
          salary: data.salary,
          hireDate: data.hireDate ? data.hireDate.substring(0, 10) : '',
          status: String(data.status),
        });
        this.loadManagerOptions(data.id);
      } else {
        this.form.reset();
        this.loadManagerOptions(null);
      }
      this.serverErrors.set({});
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPositions();
    this.loadManagerOptions(null);
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.departmentOptions.set(
            res.data.items.map((d) => ({ value: d.id, label: d.name })),
          );
        }
      },
    });
  }

  private loadPositions(): void {
    this.positionService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.positionOptions.set(
            res.data.items.map((p) => ({ value: p.id, label: p.title })),
          );
        }
      },
    });
  }

  private loadManagerOptions(excludeId: string | null): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.managerOptions.set(
            res.data.items
              .filter((e) => e.id !== excludeId)
              .map((e) => ({ value: e.id, label: e.fullName })),
          );
        }
      },
    });
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.fullName} Düzenle` : 'Yeni Çalışan';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('min')) return 'Geçerli bir değer girin';
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
        fullName: formValue.fullName,
        nationalId: formValue.nationalId,
        departmentId: formValue.departmentId,
        positionId: formValue.positionId,
        managerId: formValue.managerId || undefined,
        salary: Number(formValue.salary),
        hireDate: formValue.hireDate,
        status: Number(formValue.status) as EmployeeStatus,
      };

      this.employeeService.update(editData.id, payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Çalışan güncellendi');
            this.saved.emit();
          } else {
            this.toastService.error(res.message ?? 'İşlem başarısız');
          }
        },
        error: (err) => this.handleError(err),
      });
    } else {
      const payload = {
        fullName: formValue.fullName,
        nationalId: formValue.nationalId,
        departmentId: formValue.departmentId,
        positionId: formValue.positionId,
        managerId: formValue.managerId || undefined,
        salary: Number(formValue.salary),
        hireDate: formValue.hireDate,
      };

      this.employeeService.create(payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Çalışan oluşturuldu');
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
    this.form.reset();
    this.serverErrors.set({});
    this.closed.emit();
  }
}
