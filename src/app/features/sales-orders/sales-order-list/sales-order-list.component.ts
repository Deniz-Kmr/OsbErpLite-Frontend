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
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SalesOrderService } from '../sales-order.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, OrderStatus, OrderStatusLabel } from '@core/models/enums';
import { SalesOrderDto } from '@core/models/dto/sales-order.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Satış Siparişleri</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="navigateToCreate()">
            Yeni Sipariş
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Date Range -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 -mt-1">
        <div class="relative w-full sm:w-48">
          <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">Başlangıç</label>
          <input
            type="date"
            [ngModel]="startDate()"
            (ngModelChange)="onStartDateChange($event)"
            class="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
          />
        </div>
        <div class="relative w-full sm:w-48">
          <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">Bitiş</label>
          <input
            type="date"
            [ngModel]="endDate()"
            (ngModelChange)="onEndDateChange($event)"
            class="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
          />
        </div>
        @if (startDate() || endDate()) {
          <button
            type="button"
            class="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer mt-5"
            (click)="clearDateRange()"
          >
            Tarihleri Temizle
          </button>
        }
      </div>

      <!-- Table -->
      @if ((orderService.loading$ | async) === false && (orderService.orders$ | async)?.length === 0) {
        <app-empty-state
          icon="storefront"
          message="Henüz satış siparişi bulunmuyor"
          [actionLabel]="canCreate ? 'Yeni Sipariş' : ''"
          (action)="navigateToCreate()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((orderService.orders$ | async) ?? [])"
          [loading]="(orderService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #dateTpl let-row>
            <span class="text-sm text-[var(--text-primary)]">
              {{ row['orderDate'] | date:'dd.MM.yyyy' }}
            </span>
          </ng-template>

          <ng-template #amountTpl let-row>
            <span class="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {{ formatCurrency(row['totalAmount']) }}
            </span>
          </ng-template>

          <ng-template #statusTpl let-row>
            <app-badge variant="order" [value]="row['status']" [label]="row['statusName']" />
          </ng-template>

          <ng-template #actions let-row>
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors duration-150 cursor-pointer"
                (click)="navigateToDetail(row); $event.stopPropagation()"
                aria-label="Detay"
              >
                <i class="ph-light ph-eye text-lg"></i>
              </button>
              @if (canEdit && row['status'] === draftStatus) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors duration-150 cursor-pointer"
                  (click)="navigateToEdit(row); $event.stopPropagation()"
                  aria-label="Düzenle"
                >
                  <i class="ph-light ph-pencil-simple text-lg"></i>
                </button>
              }
              @if (canDelete && row['status'] === draftStatus) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150 cursor-pointer"
                  (click)="confirmDelete(row); $event.stopPropagation()"
                  aria-label="Sil"
                >
                  <i class="ph-light ph-trash text-lg"></i>
                </button>
              }
            </div>
          </ng-template>
        </app-data-table>

        @if (orderService.pagination$ | async; as pagination) {
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

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Sipariş Sil"
      [message]="deleteOrder() ? 'Bu sipariş silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class SalesOrderListComponent implements OnInit, AfterViewInit {
  readonly orderService = inject(SalesOrderService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');

  deleteOpen = signal(false);
  deleteOrder = signal<SalesOrderDto | null>(null);
  startDate = signal('');
  endDate = signal('');

  readonly draftStatus = OrderStatus.Draft;

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'customerName', header: 'Müşteri', sortable: true },
    { key: 'orderDate', header: 'Tarih', width: '130px', sortable: true },
    { key: 'totalAmount', header: 'Toplam Tutar', width: '150px', sortable: true },
    { key: 'status', header: 'Durum', width: '140px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Müşteri ara...', type: 'search' },
    {
      key: 'status',
      label: 'Tüm Durumlar',
      type: 'select',
      options: [
        { value: String(OrderStatus.Draft), label: OrderStatusLabel[OrderStatus.Draft] },
        { value: String(OrderStatus.Pending), label: OrderStatusLabel[OrderStatus.Pending] },
        { value: String(OrderStatus.Approved), label: OrderStatusLabel[OrderStatus.Approved] },
        { value: String(OrderStatus.Rejected), label: OrderStatusLabel[OrderStatus.Rejected] },
        { value: String(OrderStatus.Completed), label: OrderStatusLabel[OrderStatus.Completed] },
      ],
    },
  ];

  ngOnInit(): void {
    this.orderService.loadOrders(this.currentParams);
  }

  ngAfterViewInit(): void {
    const dTpl = this.dateTpl();
    const aTpl = this.amountTpl();
    const sTpl = this.statusTpl();

    this.columns = this.columns.map((col) => {
      if (col.key === 'orderDate' && dTpl) return { ...col, template: dTpl };
      if (col.key === 'totalAmount' && aTpl) return { ...col, template: aTpl };
      if (col.key === 'status' && sTpl) return { ...col, template: sTpl };
      return col;
    });
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      status: filters['status'] || undefined,
    };
    this.orderService.loadOrders(this.currentParams);
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      startDate: value || undefined,
    };
    this.orderService.loadOrders(this.currentParams);
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      endDate: value || undefined,
    };
    this.orderService.loadOrders(this.currentParams);
  }

  clearDateRange(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      startDate: undefined,
      endDate: undefined,
    };
    this.orderService.loadOrders(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.orderService.loadOrders(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.orderService.loadOrders(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.orderService.loadOrders(this.currentParams);
  }

  navigateToCreate(): void {
    this.router.navigate(['/sales-orders', 'new']);
  }

  navigateToEdit(row: Record<string, unknown>): void {
    this.router.navigate(['/sales-orders', row['id'], 'edit']);
  }

  navigateToDetail(row: Record<string, unknown>): void {
    this.router.navigate(['/sales-orders', row['id']]);
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.deleteOrder.set(row as unknown as SalesOrderDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const order = this.deleteOrder();
    if (!order) return;

    this.orderService.delete(order.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Sipariş başarıyla silindi');
          this.orderService.loadOrders(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteOrder.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Sipariş silinemedi');
        this.deleteOpen.set(false);
        this.deleteOrder.set(null);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  }
}
