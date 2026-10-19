import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LeaveRequestService } from '../leave-request.service';
import { EmployeeService } from '@features/employees/employee.service';
import { ToastService } from '@shared/components/toast/toast.service';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-leave-request-form',
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
      title="Yeni İzin Talebi"
      (closed)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <app-select
          label="Çalışan"
          formControlName="employeeId"
          placeholder="Çalışan seçin"
          [options]="employeeOptions()"
          [error]="getError('employeeId')"
        />

        <app-input
          label="Başlangıç Tarihi"
          type="date"
          formControlName="startDate"
          [error]="getError('startDate')"
        />

        <app-input
          label="Bitiş Tarihi"
          type="date"
          formControlName="endDate"
          [error]="getError('endDate')"
        />

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-medium text-[var(--text-primary)]">Neden</label>
          <textarea
            formControlName="reason"
            placeholder="İzin nedeni (opsiyonel)"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
          ></textarea>
        </div>
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
export class LeaveRequestFormComponent implements OnInit {
  open = input.required<boolean>();

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly leaveRequestService = inject(LeaveRequestService);
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);
  employeeOptions = signal<SelectOption[]>([]);

  form = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: [''],
  });

  private serverErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employeeOptions.set(
            res.data.items.map((e) => ({ value: e.id, label: e.fullName })),
          );
        }
      },
    });
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
      employeeId: formValue.employeeId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      reason: formValue.reason || undefined,
    };

    this.leaveRequestService.create(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success('İzin talebi oluşturuldu');
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
}
