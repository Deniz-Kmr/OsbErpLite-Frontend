import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DepartmentService } from '../department.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole } from '@core/models/enums';
import { DepartmentDto } from '@core/models/dto/department.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { DepartmentFormComponent } from '../department-form/department-form.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    DepartmentFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Departmanlar</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni Departman
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((departmentService.loading$ | async) === false && (departmentService.departments$ | async)?.length === 0) {
        <app-empty-state
          icon="buildings"
          message="Henüz departman eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((departmentService.departments$ | async) ?? [])"
          [loading]="(departmentService.loading$ | async) ?? false"
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

        @if (departmentService.pagination$ | async; as pagination) {
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
    <app-department-form
      [open]="formOpen()"
      [editData]="editDepartment()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Departman Sil"
      [message]="deleteDepartment() ? deleteDepartment()!.name + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class DepartmentListComponent implements OnInit {
  readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  formOpen = signal(false);
  editDepartment = signal<DepartmentDto | null>(null);
  deleteOpen = signal(false);
  deleteDepartment = signal<DepartmentDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'name', header: 'Departman Adı', sortable: true },
    { key: 'managerName', header: 'Yönetici', sortable: true },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Departman ara...', type: 'search' },
  ];

  ngOnInit(): void {
    this.departmentService.loadDepartments(this.currentParams);
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
    };
    this.departmentService.loadDepartments(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.departmentService.loadDepartments(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.departmentService.loadDepartments(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.departmentService.loadDepartments(this.currentParams);
  }

  openCreateForm(): void {
    this.editDepartment.set(null);
    this.formOpen.set(true);
  }

  openEditForm(department: Record<string, unknown>): void {
    this.editDepartment.set(department as unknown as DepartmentDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editDepartment.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.departmentService.loadDepartments(this.currentParams);
  }

  confirmDelete(department: Record<string, unknown>): void {
    this.deleteDepartment.set(department as unknown as DepartmentDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const department = this.deleteDepartment();
    if (!department) return;

    this.departmentService.delete(department.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${department.name} başarıyla silindi`);
          this.departmentService.loadDepartments(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteDepartment.set(null);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Bu departmanda aktif çalışanlar var, silinemez';
        this.toastService.error(msg);
        this.deleteOpen.set(false);
        this.deleteDepartment.set(null);
      },
    });
  }
}
