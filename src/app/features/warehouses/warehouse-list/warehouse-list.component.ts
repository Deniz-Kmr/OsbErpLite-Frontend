import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { WarehouseService } from '../warehouse.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole } from '@core/models/enums';
import { WarehouseDto } from '@core/models/dto/warehouse.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { WarehouseFormComponent } from '../warehouse-form/warehouse-form.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    WarehouseFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Depolar</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni Depo
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((warehouseService.loading$ | async) === false && (warehouseService.warehouses$ | async)?.length === 0) {
        <app-empty-state
          icon="warehouse"
          message="Henüz depo eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((warehouseService.warehouses$ | async) ?? [])"
          [loading]="(warehouseService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
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

        @if (warehouseService.pagination$ | async; as pagination) {
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
    <app-warehouse-form
      [open]="formOpen()"
      [editData]="editWarehouse()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Depo Sil"
      [message]="deleteWarehouse() ? deleteWarehouse()!.name + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class WarehouseListComponent implements OnInit {
  readonly warehouseService = inject(WarehouseService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  formOpen = signal(false);
  editWarehouse = signal<WarehouseDto | null>(null);
  deleteOpen = signal(false);
  deleteWarehouse = signal<WarehouseDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'name', header: 'Depo Adı', sortable: true },
    { key: 'location', header: 'Lokasyon', sortable: true },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Depo ara...', type: 'search' },
  ];

  ngOnInit(): void {
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
    };
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  openCreateForm(): void {
    this.editWarehouse.set(null);
    this.formOpen.set(true);
  }

  openEditForm(warehouse: Record<string, unknown>): void {
    this.editWarehouse.set(warehouse as unknown as WarehouseDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editWarehouse.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.warehouseService.loadWarehouses(this.currentParams);
  }

  confirmDelete(warehouse: Record<string, unknown>): void {
    this.deleteWarehouse.set(warehouse as unknown as WarehouseDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const warehouse = this.deleteWarehouse();
    if (!warehouse) return;

    this.warehouseService.delete(warehouse.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${warehouse.name} başarıyla silindi`);
          this.warehouseService.loadWarehouses(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteWarehouse.set(null);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Bu depoda aktif ürünler var, silinemez';
        this.toastService.error(msg);
        this.deleteOpen.set(false);
        this.deleteWarehouse.set(null);
      },
    });
  }
}
