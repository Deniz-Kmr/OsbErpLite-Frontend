import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { ProductService } from '../product.service';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole } from '@core/models/enums';
import { ProductDto } from '@core/models/dto/product.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    ProductFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Ürünler</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni Ürün
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((productService.loading$ | async) === false && (productService.products$ | async)?.length === 0) {
        <app-empty-state
          icon="package"
          message="Henüz ürün eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((productService.products$ | async) ?? [])"
          [loading]="(productService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #unitPriceTpl let-row>
            <span class="font-mono text-[13px]">
              {{ formatCurrency(row['unitPrice']) }}
            </span>
          </ng-template>

          <ng-template #stockTpl let-row>
            <div class="flex items-center gap-2">
              <span class="font-mono text-[13px]"
                [class]="isLowStock(row['stockQuantity']) ? 'text-[var(--destructive)] font-semibold' : ''">
                {{ row['stockQuantity'] }}
              </span>
              @if (isLowStock(row['stockQuantity'])) {
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 dark:bg-red-950/30 text-[var(--destructive)]">
                  <i class="ph-light ph-warning text-xs"></i>
                  Düşük
                </span>
              }
            </div>
          </ng-template>

          <ng-template #actions let-row>
            <div class="flex items-center justify-end gap-1">
              @if (canEdit) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors duration-150 cursor-pointer"
                  (click)="openEditForm(row)"
                  aria-label="Düzenle"
                >
                  <i class="ph-light ph-pencil-simple text-lg"></i>
                </button>
              }
              @if (canDelete) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150 cursor-pointer"
                  (click)="confirmDelete(row)"
                  aria-label="Sil"
                >
                  <i class="ph-light ph-trash text-lg"></i>
                </button>
              }
            </div>
          </ng-template>
        </app-data-table>

        @if (productService.pagination$ | async; as pagination) {
          @if (pagination && pagination.totalPages > 1) {
            <app-pagination
              [currentPage]="pagination.page"
              [totalPages]="pagination.totalPages"
              [pageSize]="pagination.pageSize"
              [totalCount]="pagination.totalCount"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          }
        }
      }
    </div>

    <!-- Form Modal -->
    <app-product-form
      [open]="formOpen()"
      [editData]="editProduct()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Ürün Sil"
      [message]="deleteProduct() ? deleteProduct()!.name + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class ProductListComponent implements OnInit, AfterViewInit {
  readonly productService = inject(ProductService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly unitPriceTpl = viewChild<TemplateRef<unknown>>('unitPriceTpl');
  readonly stockTpl = viewChild<TemplateRef<unknown>>('stockTpl');

  formOpen = signal(false);
  editProduct = signal<ProductDto | null>(null);
  deleteOpen = signal(false);
  deleteProduct = signal<ProductDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'name', header: 'Ad', sortable: true },
    { key: 'sku', header: 'SKU', width: '120px', sortable: true },
    { key: 'unitPrice', header: 'Birim Fiyat', width: '140px', sortable: true },
    { key: 'stockQuantity', header: 'Stok', width: '140px', sortable: true },
    { key: 'warehouseName', header: 'Depo', width: '160px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Ürün ara...', type: 'search' },
    {
      key: 'warehouseId',
      label: 'Tüm Depolar',
      type: 'select',
      options: [],
    },
  ];

  private readonly LOW_STOCK_THRESHOLD = 10;

  ngOnInit(): void {
    this.productService.loadProducts(this.currentParams);
    this.loadWarehouseFilter();
  }

  ngAfterViewInit(): void {
    const priceTpl = this.unitPriceTpl();
    const sTpl = this.stockTpl();
    if (priceTpl) {
      this.columns = this.columns.map((col) =>
        col.key === 'unitPrice' ? { ...col, template: priceTpl } : col,
      );
    }
    if (sTpl) {
      this.columns = this.columns.map((col) =>
        col.key === 'stockQuantity' ? { ...col, template: sTpl } : col,
      );
    }
  }

  private loadWarehouseFilter(): void {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const warehouseFilter = this.filterDefs.find((f) => f.key === 'warehouseId');
          if (warehouseFilter && warehouseFilter.type === 'select') {
            warehouseFilter.options = res.data.items.map((w) => ({
              value: w.id,
              label: w.name,
            }));
            this.filterDefs = [...this.filterDefs];
          }
        }
      },
    });
  }

  isLowStock(quantity: unknown): boolean {
    return typeof quantity === 'number' && quantity < this.LOW_STOCK_THRESHOLD;
  }

  formatCurrency(value: unknown): string {
    if (typeof value !== 'number') return '—';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      warehouseId: filters['warehouseId'] || undefined,
    };
    this.productService.loadProducts(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.productService.loadProducts(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.productService.loadProducts(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.productService.loadProducts(this.currentParams);
  }

  openCreateForm(): void {
    this.editProduct.set(null);
    this.formOpen.set(true);
  }

  openEditForm(product: Record<string, unknown>): void {
    this.editProduct.set(product as unknown as ProductDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editProduct.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.productService.loadProducts(this.currentParams);
  }

  confirmDelete(product: Record<string, unknown>): void {
    this.deleteProduct.set(product as unknown as ProductDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const product = this.deleteProduct();
    if (!product) return;

    this.productService.delete(product.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${product.name} başarıyla silindi`);
          this.productService.loadProducts(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteProduct.set(null);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Bu ürün aktif siparişlerde kullanılıyor, silinemez';
        this.toastService.error(msg);
        this.deleteOpen.set(false);
        this.deleteProduct.set(null);
      },
    });
  }
}
