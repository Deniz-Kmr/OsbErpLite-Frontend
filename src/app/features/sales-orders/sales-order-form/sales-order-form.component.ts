import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { SalesOrderService } from '../sales-order.service';
import { BusinessPartnerService } from '@features/business-partners/business-partner.service';
import { ProductService } from '@features/products/product.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { BusinessPartnerType } from '@core/models/enums';
import { BusinessPartnerDto } from '@core/models/dto/business-partner.dto';
import { ProductDto } from '@core/models/dto/product.dto';
import { SalesOrderDto } from '@core/models/dto/sales-order.dto';

import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">
          {{ isEdit() ? 'Sipariş Düzenle' : 'Yeni Satış Siparişi' }}
        </h1>
        <app-button variant="secondary" icon="arrow-left" (clicked)="goBack()">
          Geri
        </app-button>
      </div>

      <!-- Form Card -->
      <div class="rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Customer + Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-select
              label="Müşteri"
              formControlName="customerId"
              placeholder="Müşteri seçin"
              [options]="customerOptions()"
              [error]="getError('customerId')"
            />

            <div class="flex flex-col gap-1">
              <label class="text-[13px] font-medium text-[var(--text-primary)]">Sipariş Tarihi</label>
              <input
                type="date"
                formControlName="orderDate"
                class="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
              />
              @if (getError('orderDate')) {
                <span class="text-xs text-[var(--destructive)]">{{ getError('orderDate') }}</span>
              }
            </div>
          </div>

          <!-- Order Lines -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-[var(--text-primary)]">Ürün Satırları</h3>
              <app-button variant="secondary" size="sm" icon="plus" (clicked)="addLine()">
                Satır Ekle
              </app-button>
            </div>

            @if (lines.length === 0) {
              <p class="text-sm text-[var(--text-muted)] py-4 text-center">
                Henüz ürün satırı eklenmemiş
              </p>
            }

            @for (line of lines.controls; track $index; let i = $index) {
              <div class="grid grid-cols-12 gap-3 items-end p-4 rounded-xl bg-[var(--bg-muted)]"
                   [formGroupName]="i">
                <div class="col-span-12 md:col-span-4">
                  <app-select
                    label="Ürün"
                    formControlName="productId"
                    placeholder="Ürün seçin"
                    [options]="productOptions()"
                    [error]="getLineError(i, 'productId')"
                  />
                </div>

                <div class="col-span-4 md:col-span-2">
                  <app-input
                    label="Miktar"
                    type="number"
                    formControlName="quantity"
                    placeholder="0"
                    [error]="getLineError(i, 'quantity')"
                  />
                </div>

                <div class="col-span-4 md:col-span-2">
                  <app-input
                    label="Birim Fiyat"
                    type="number"
                    formControlName="unitPrice"
                    placeholder="0.00"
                    [error]="getLineError(i, 'unitPrice')"
                  />
                </div>

                <div class="col-span-3 md:col-span-3">
                  <label class="block text-[13px] font-medium text-[var(--text-primary)] mb-1">Satır Toplamı</label>
                  <div class="h-10 flex items-center px-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] font-mono text-[13px] font-semibold text-[var(--text-primary)]">
                    {{ formatCurrency(getLineTotal(i)) }}
                  </div>
                </div>

                <div class="col-span-1 flex justify-end">
                  <button
                    type="button"
                    class="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150 cursor-pointer"
                    (click)="removeLine(i)"
                    aria-label="Satırı Sil"
                  >
                    <i class="ph-light ph-trash text-lg"></i>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Grand Total -->
          @if (lines.length > 0) {
            <div class="flex justify-end pt-2">
              <div class="text-right">
                <span class="text-sm text-[var(--text-secondary)]">Genel Toplam: </span>
                <span class="font-mono text-xl font-bold text-[var(--text-primary)]">
                  {{ formatCurrency(grandTotal()) }}
                </span>
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <app-button variant="secondary" (clicked)="goBack()">İptal</app-button>
            <app-button
              variant="primary"
              [loading]="submitting()"
              [disabled]="form.invalid || lines.length === 0"
              (clicked)="onSubmit()"
            >
              {{ isEdit() ? 'Güncelle' : 'Oluştur' }}
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SalesOrderFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(SalesOrderService);
  private readonly partnerService = inject(BusinessPartnerService);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  submitting = signal(false);
  isEdit = signal(false);
  customerOptions = signal<SelectOption[]>([]);
  productOptions = signal<SelectOption[]>([]);

  private editOrder: SalesOrderDto | null = null;
  private serverErrors = signal<Record<string, string>>({});
  private subscriptions: Subscription[] = [];

  form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    orderDate: ['', Validators.required],
    lines: this.fb.array<FormGroup>([]),
  });

  get lines(): FormArray<FormGroup> {
    return this.form.controls.lines;
  }

  grandTotal = computed(() => {
    let total = 0;
    for (let i = 0; i < this.lines.length; i++) {
      total += this.getLineTotal(i);
    }
    return total;
  });

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.loadOrder(id);
    } else {
      this.form.patchValue({ orderDate: new Date().toISOString().split('T')[0] });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private loadCustomers(): void {
    this.partnerService.loadPartners({ pageNumber: 1, pageSize: 200 });
    const sub = this.partnerService.partners$.subscribe((partners) => {
      const customers = partners.filter(
        (p: BusinessPartnerDto) =>
          p.type === BusinessPartnerType.Customer || p.type === BusinessPartnerType.Both,
      );
      this.customerOptions.set(
        customers.map((c) => ({ value: c.id, label: c.name })),
      );
    });
    this.subscriptions.push(sub);
  }

  private loadProducts(): void {
    this.productService.loadProducts({ pageNumber: 1, pageSize: 200 });
    const sub = this.productService.products$.subscribe((products) => {
      this.productOptions.set(
        products.map((p: ProductDto) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
      );
    });
    this.subscriptions.push(sub);
  }

  private loadOrder(id: string): void {
    this.orderService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.editOrder = res.data;
          this.form.patchValue({
            customerId: res.data.customerId,
            orderDate: res.data.orderDate.split('T')[0],
          });
          this.lines.clear();
          for (const line of res.data.lines) {
            this.lines.push(
              this.fb.nonNullable.group({
                productId: [line.productId, Validators.required],
                quantity: [line.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [line.unitPrice, [Validators.required, Validators.min(0.01)]],
              }),
            );
          }
        }
      },
      error: () => {
        this.toastService.error('Sipariş yüklenemedi');
        this.router.navigate(['/sales-orders']);
      },
    });
  }

  addLine(): void {
    this.lines.push(
      this.fb.nonNullable.group({
        productId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      }),
    );
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  getLineTotal(index: number): number {
    const line = this.lines.at(index);
    const qty = line.get('quantity')?.value ?? 0;
    const price = line.get('unitPrice')?.value ?? 0;
    return qty * price;
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    const serverErr = this.serverErrors()[field];
    if (serverErr) return serverErr;

    if (control.hasError('required')) return 'Bu alan zorunludur';
    return '';
  }

  getLineError(lineIndex: number, field: string): string {
    const control = this.lines.at(lineIndex).get(field);
    if (!control || (!control.touched && !control.dirty)) return '';

    if (control.hasError('required')) return 'Zorunlu';
    if (control.hasError('min')) return 'Geçersiz değer';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid || this.lines.length === 0) {
      this.form.markAllAsTouched();
      this.lines.controls.forEach((g) => g.markAllAsTouched());
      if (this.lines.length === 0) {
        this.toastService.error('En az bir ürün satırı ekleyin');
      }
      return;
    }

    this.submitting.set(true);
    this.serverErrors.set({});

    const formValue = this.form.getRawValue();
    const payload = {
      customerId: formValue.customerId,
      orderDate: formValue.orderDate,
      lines: formValue.lines.map((l) => ({
        productId: l['productId'] as string,
        quantity: Number(l['quantity']),
        unitPrice: Number(l['unitPrice']),
      })),
    };

    const request$ = this.editOrder
      ? this.orderService.update(this.editOrder.id, payload)
      : this.orderService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.toastService.success(
            this.editOrder ? 'Sipariş güncellendi' : 'Sipariş oluşturuldu',
          );
          this.router.navigate(['/sales-orders', res.data?.id ?? '']);
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

  goBack(): void {
    this.router.navigate(['/sales-orders']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  }
}
