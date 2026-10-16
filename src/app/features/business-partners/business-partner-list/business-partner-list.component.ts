import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { BusinessPartnerService } from '../business-partner.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, BusinessPartnerType, BusinessPartnerTypeLabel } from '@core/models/enums';
import { BusinessPartnerDto } from '@core/models/dto/business-partner.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BusinessPartnerFormComponent } from '../business-partner-form/business-partner-form.component';

@Component({
  selector: 'app-business-partner-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BusinessPartnerFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">İş Ortakları</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni İş Ortağı
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((partnerService.loading$ | async) === false && (partnerService.partners$ | async)?.length === 0) {
        <app-empty-state
          icon="users-three"
          message="Henüz iş ortağı eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((partnerService.partners$ | async) ?? [])"
          [loading]="(partnerService.loading$ | async) ?? false"
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

        @if (partnerService.pagination$ | async; as pagination) {
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
    <app-business-partner-form
      [open]="formOpen()"
      [editData]="editPartner()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="İş Ortağı Sil"
      [message]="deletePartner() ? deletePartner()!.name + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class BusinessPartnerListComponent implements OnInit {
  readonly partnerService = inject(BusinessPartnerService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly typeBadge = viewChild<TemplateRef<unknown>>('typeBadge');

  formOpen = signal(false);
  editPartner = signal<BusinessPartnerDto | null>(null);
  deleteOpen = signal(false);
  deletePartner = signal<BusinessPartnerDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'name', header: 'Ad', sortable: true },
    { key: 'taxNumber', header: 'Vergi No', width: '140px' },
    { key: 'typeName', header: 'Tip', width: '160px' },
    { key: 'phone', header: 'Telefon', width: '150px' },
    { key: 'email', header: 'Email', width: '200px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'İş ortağı ara...', type: 'search' },
    {
      key: 'type',
      label: 'Tüm Tipler',
      type: 'select',
      options: [
        { value: String(BusinessPartnerType.Customer), label: BusinessPartnerTypeLabel[BusinessPartnerType.Customer] },
        { value: String(BusinessPartnerType.Supplier), label: BusinessPartnerTypeLabel[BusinessPartnerType.Supplier] },
        { value: String(BusinessPartnerType.Both), label: BusinessPartnerTypeLabel[BusinessPartnerType.Both] },
      ],
    },
  ];

  ngOnInit(): void {
    this.partnerService.loadPartners(this.currentParams);
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      type: filters['type'] || undefined,
    };
    this.partnerService.loadPartners(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.partnerService.loadPartners(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.partnerService.loadPartners(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.partnerService.loadPartners(this.currentParams);
  }

  openCreateForm(): void {
    this.editPartner.set(null);
    this.formOpen.set(true);
  }

  openEditForm(partner: Record<string, unknown>): void {
    this.editPartner.set(partner as unknown as BusinessPartnerDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editPartner.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.partnerService.loadPartners(this.currentParams);
  }

  confirmDelete(partner: Record<string, unknown>): void {
    this.deletePartner.set(partner as unknown as BusinessPartnerDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const partner = this.deletePartner();
    if (!partner) return;

    this.partnerService.delete(partner.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${partner.name} başarıyla silindi`);
          this.partnerService.loadPartners(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deletePartner.set(null);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Bu iş ortağı aktif siparişlere sahip, silinemez';
        this.toastService.error(msg);
        this.deleteOpen.set(false);
        this.deletePartner.set(null);
      },
    });
  }
}
