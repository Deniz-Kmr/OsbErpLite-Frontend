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

import { BusinessPartnerService } from '../business-partner.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { BusinessPartnerType, BusinessPartnerTypeLabel } from '@core/models/enums';
import { BusinessPartnerDto } from '@core/models/dto/business-partner.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-business-partner-form',
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
          label="Şirket Adı"
          formControlName="name"
          placeholder="Şirket adını girin"
          [error]="getError('name')"
        />

        <app-input
          label="Vergi Numarası"
          formControlName="taxNumber"
          placeholder="Vergi numarası"
          [error]="getError('taxNumber')"
        />

        <app-select
          label="Tip"
          formControlName="type"
          placeholder="Tip seçin"
          [options]="typeOptions"
          [error]="getError('type')"
        />

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-medium text-[var(--text-primary)]">Adres</label>
          <textarea
            formControlName="address"
            placeholder="Adres"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
          ></textarea>
        </div>

        <app-input
          label="Şehir"
          formControlName="city"
          placeholder="Şehir"
          [error]="getError('city')"
        />

        <app-input
          label="Telefon"
          type="tel"
          formControlName="phone"
          placeholder="Telefon numarası"
          [error]="getError('phone')"
        />

        <app-input
          label="Email"
          type="email"
          formControlName="email"
          placeholder="Email adresi"
          [error]="getError('email')"
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
export class BusinessPartnerFormComponent {
  open = input.required<boolean>();
  editData = input<BusinessPartnerDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly partnerService = inject(BusinessPartnerService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);

  typeOptions: SelectOption[] = [
    { value: String(BusinessPartnerType.Customer), label: BusinessPartnerTypeLabel[BusinessPartnerType.Customer] },
    { value: String(BusinessPartnerType.Supplier), label: BusinessPartnerTypeLabel[BusinessPartnerType.Supplier] },
    { value: String(BusinessPartnerType.Both), label: BusinessPartnerTypeLabel[BusinessPartnerType.Both] },
  ];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    taxNumber: [''],
    type: ['', Validators.required],
    address: [''],
    city: [''],
    phone: [''],
    email: ['', Validators.email],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          name: data.name,
          taxNumber: data.taxNumber ?? '',
          type: String(data.type),
          address: data.address ?? '',
          city: data.city ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
        });
      } else {
        this.form.reset();
      }
      this.serverErrors.set({});
    });
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.name} Düzenle` : 'Yeni İş Ortağı';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('email')) return 'Geçerli bir email adresi girin';
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
      taxNumber: formValue.taxNumber || undefined,
      type: Number(formValue.type) as BusinessPartnerType,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      phone: formValue.phone || undefined,
      email: formValue.email || undefined,
    };

    const editData = this.editData();
    const request$ = editData
      ? this.partnerService.update(editData.id, payload)
      : this.partnerService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success(
            editData ? 'İş ortağı güncellendi' : 'İş ortağı oluşturuldu',
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
}
