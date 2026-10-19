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

import { LeaveRequestService } from '../leave-request.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, LeaveRequestStatus, LeaveRequestStatusLabel } from '@core/models/enums';
import { LeaveRequestDto } from '@core/models/dto/leave-request.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { LeaveRequestFormComponent } from '../leave-request-form/leave-request-form.component';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    LeaveRequestFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">İzin Talepleri</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni İzin Talebi
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((requestService.loading$ | async) === false && (requestService.requests$ | async)?.length === 0) {
        <app-empty-state
          icon="calendar"
          message="Henüz izin talebi bulunmuyor"
          [actionLabel]="canCreate ? 'Yeni Talep' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((requestService.requests$ | async) ?? [])"
          [loading]="(requestService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #startDateTpl let-row>
            <span class="text-sm text-[var(--text-primary)]">
              {{ row['startDate'] | date:'dd.MM.yyyy' }}
            </span>
          </ng-template>

          <ng-template #endDateTpl let-row>
            <span class="text-sm text-[var(--text-primary)]">
              {{ row['endDate'] | date:'dd.MM.yyyy' }}
            </span>
          </ng-template>

          <ng-template #daysTpl let-row>
            <span class="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
              {{ calculateDays(row['startDate'], row['endDate']) }}
            </span>
          </ng-template>

          <ng-template #statusTpl let-row>
            <app-badge variant="leave" [value]="row['status']" [label]="row['statusName']" />
          </ng-template>

          <ng-template #actions let-row>
            <div class="flex items-center justify-end gap-1">
              @if (canApprove && row['status'] === pendingStatus) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-150 cursor-pointer"
                  (click)="approveRequest(row)"
                  aria-label="Onayla"
                >
                  <i class="ph-light ph-check-circle text-lg"></i>
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150 cursor-pointer"
                  (click)="rejectRequest(row)"
                  aria-label="Reddet"
                >
                  <i class="ph-light ph-x-circle text-lg"></i>
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

        @if (requestService.pagination$ | async; as pagination) {
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
    <app-leave-request-form
      [open]="formOpen()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="İzin Talebi Sil"
      [message]="deleteRequest() ? deleteRequest()!.employeeName + ' - izin talebi silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />

    <!-- Approve Confirm -->
    <app-confirm-dialog
      [open]="approveOpen()"
      title="İzin Talebi Onayla"
      [message]="actionRequest() ? actionRequest()!.employeeName + ' için izin talebi onaylanacak.' : ''"
      confirmLabel="Onayla"
      confirmVariant="primary"
      (confirm)="onApproveConfirm()"
      (cancel)="approveOpen.set(false)"
    />

    <!-- Reject Confirm -->
    <app-confirm-dialog
      [open]="rejectOpen()"
      title="İzin Talebi Reddet"
      [message]="actionRequest() ? actionRequest()!.employeeName + ' için izin talebi reddedilecek.' : ''"
      confirmLabel="Reddet"
      (confirm)="onRejectConfirm()"
      (cancel)="rejectOpen.set(false)"
    />
  `,
})
export class LeaveRequestListComponent implements OnInit, AfterViewInit {
  readonly requestService = inject(LeaveRequestService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly startDateTpl = viewChild<TemplateRef<unknown>>('startDateTpl');
  readonly endDateTpl = viewChild<TemplateRef<unknown>>('endDateTpl');
  readonly daysTpl = viewChild<TemplateRef<unknown>>('daysTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');

  formOpen = signal(false);
  deleteOpen = signal(false);
  deleteRequest = signal<LeaveRequestDto | null>(null);
  approveOpen = signal(false);
  rejectOpen = signal(false);
  actionRequest = signal<LeaveRequestDto | null>(null);

  readonly pendingStatus = LeaveRequestStatus.Pending;

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canApprove = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'employeeName', header: 'Çalışan', sortable: true },
    { key: 'startDate', header: 'Başlangıç', width: '120px', sortable: true },
    { key: 'endDate', header: 'Bitiş', width: '120px', sortable: true },
    { key: 'days', header: 'Gün', width: '80px' },
    { key: 'status', header: 'Durum', width: '120px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Çalışan ara...', type: 'search' },
    {
      key: 'status',
      label: 'Tüm Durumlar',
      type: 'select',
      options: [
        { value: String(LeaveRequestStatus.Pending), label: LeaveRequestStatusLabel[LeaveRequestStatus.Pending] },
        { value: String(LeaveRequestStatus.Approved), label: LeaveRequestStatusLabel[LeaveRequestStatus.Approved] },
        { value: String(LeaveRequestStatus.Rejected), label: LeaveRequestStatusLabel[LeaveRequestStatus.Rejected] },
      ],
    },
  ];

  ngOnInit(): void {
    this.requestService.loadRequests(this.currentParams);
  }

  ngAfterViewInit(): void {
    const sdTpl = this.startDateTpl();
    const edTpl = this.endDateTpl();
    const dTpl = this.daysTpl();
    const sTpl = this.statusTpl();

    this.columns = this.columns.map((col) => {
      if (col.key === 'startDate' && sdTpl) return { ...col, template: sdTpl };
      if (col.key === 'endDate' && edTpl) return { ...col, template: edTpl };
      if (col.key === 'days' && dTpl) return { ...col, template: dTpl };
      if (col.key === 'status' && sTpl) return { ...col, template: sTpl };
      return col;
    });
  }

  calculateDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      status: filters['status'] || undefined,
    };
    this.requestService.loadRequests(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.requestService.loadRequests(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.requestService.loadRequests(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.requestService.loadRequests(this.currentParams);
  }

  openCreateForm(): void {
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  onSaved(): void {
    this.closeForm();
    this.requestService.loadRequests(this.currentParams);
  }

  approveRequest(row: Record<string, unknown>): void {
    this.actionRequest.set(row as unknown as LeaveRequestDto);
    this.approveOpen.set(true);
  }

  rejectRequest(row: Record<string, unknown>): void {
    this.actionRequest.set(row as unknown as LeaveRequestDto);
    this.rejectOpen.set(true);
  }

  onApproveConfirm(): void {
    const request = this.actionRequest();
    if (!request) return;

    this.requestService.updateStatus(request.id, LeaveRequestStatus.Approved).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('İzin talebi onaylandı');
          this.requestService.loadRequests(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'İşlem başarısız');
        }
        this.approveOpen.set(false);
        this.actionRequest.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Onaylama başarısız');
        this.approveOpen.set(false);
        this.actionRequest.set(null);
      },
    });
  }

  onRejectConfirm(): void {
    const request = this.actionRequest();
    if (!request) return;

    this.requestService.updateStatus(request.id, LeaveRequestStatus.Rejected).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('İzin talebi reddedildi');
          this.requestService.loadRequests(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'İşlem başarısız');
        }
        this.rejectOpen.set(false);
        this.actionRequest.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Reddetme başarısız');
        this.rejectOpen.set(false);
        this.actionRequest.set(null);
      },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.deleteRequest.set(row as unknown as LeaveRequestDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const request = this.deleteRequest();
    if (!request) return;

    this.requestService.delete(request.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('İzin talebi silindi');
          this.requestService.loadRequests(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteRequest.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'İzin talebi silinemedi');
        this.deleteOpen.set(false);
        this.deleteRequest.set(null);
      },
    });
  }
}
