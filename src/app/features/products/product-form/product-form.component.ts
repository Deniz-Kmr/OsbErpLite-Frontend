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

import { ProductService } from '../product.service';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ProductDto } from '@core/models/dto/product.dto';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-product-form',
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
          label="Ürün Adı"
          formControlName="name"
          placeholder="Ürün adını girin"
          [error]="getError('name')"
        />

        <app-input
          label="SKU"
          formControlName="sku"
          placeholder="Stok kodu"
          [error]="getError('sku')"
        />

        <app-input
          label="Birim Fiyat"
          type="number"
          formControlName="unitPrice"
          placeholder="0.00"
          [error]="getError('unitPrice')"
        />

        @if (!editData()) {
          <app-input
            label="Başlangıç Stok Miktarı"
            type="number"
            formControlName="stockQuantity"
            placeholder="0"
            [error]="getError('stockQuantity')"
          />
        }

        <app-select
          label="Depo"
          formControlName="warehouseId"
          placeholder="Depo seçin"
          [options]="warehouseOptions()"
          [error]="getError('warehouseId')"
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
export class ProductFormComponent implements OnInit {
  open = input.required<boolean>();
  editData = input<ProductDto | null>(null);

  closed = output<void>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);
  warehouseOptions = signal<SelectOption[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    warehouseId: ['', Validators.required],
  });

  private serverErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const data = this.editData();
      if (data) {
        this.form.patchValue({
          name: data.name,
          sku: data.sku,
          unitPrice: data.unitPrice,
          warehouseId: data.warehouseId,
        });
      } else {
        this.form.reset();
      }
      this.serverErrors.set({});
    });
  }

  ngOnInit(): void {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.warehouseOptions.set(
            res.data.items.map((w) => ({
              value: w.id,
              label: w.name,
            })),
          );
        }
      },
    });
  }

  modalTitle(): string {
    const data = this.editData();
    return data ? `${data.name} Düzenle` : 'Yeni Ürün';
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    if (control.hasError('min')) return 'Değer 0 veya daha büyük olmalıdır';
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
      const updatePayload = {
        name: formValue.name,
        sku: formValue.sku,
        unitPrice: formValue.unitPrice,
        warehouseId: formValue.warehouseId,
      };
      this.productService.update(editData.id, updatePayload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Ürün güncellendi');
            this.saved.emit();
          } else {
            this.toastService.error(res.message ?? 'İşlem başarısız');
          }
        },
        error: (err) => this.handleError(err),
      });
    } else {
      const createPayload = {
        name: formValue.name,
        sku: formValue.sku,
        unitPrice: formValue.unitPrice,
        stockQuantity: formValue.stockQuantity,
        warehouseId: formValue.warehouseId,
      };
      this.productService.create(createPayload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.toastService.success('Ürün oluşturuldu');
            this.saved.emit();
          } else {
            this.toastService.error(res.message ?? 'İşlem başarısız');
          }
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(err: { status?: number; error?: { errors?: Record<string, unknown>; message?: string } }): void {
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
