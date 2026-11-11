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

import { EmployeeService } from '../employee.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, EmployeeStatus, EmployeeStatusLabel } from '@core/models/enums';
import { EmployeeDto } from '@core/models/dto/employee.dto';
import { QueryParams } from '@core/models/paginated-list.model';
import { DepartmentService } from '@features/departments/department.service';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BadgeComponent,
    EmployeeFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Çalışanlar</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni Çalışan
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((employeeService.loading$ | async) === false && (employeeService.employees$ | async)?.length === 0) {
        <app-empty-state
          icon="user-list"
          message="Henüz çalışan eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((employeeService.employees$ | async) ?? [])"
          [loading]="(employeeService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #statusTpl let-row>
            <app-badge variant="employee" [value]="row['status']" [label]="row['statusName']" />
          </ng-template>

          <ng-template #salaryTpl let-row>
            @if (canViewSalary) {
              <span class="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
                {{ formatCurrency(row['salary']) }}
              </span>
            } @else {
              <span class="text-[var(--text-muted)] text-sm">—</span>
            }
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

        @if (employeeService.pagination$ | async; as pagination) {
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
    <app-employee-form
      [open]="formOpen()"
      [editData]="editEmployee()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Çalışan Sil"
      [message]="deleteEmployee() ? deleteEmployee()!.fullName + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly departmentService = inject(DepartmentService);

  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly salaryTpl = viewChild<TemplateRef<unknown>>('salaryTpl');

  formOpen = signal(false);
  editEmployee = signal<EmployeeDto | null>(null);
  deleteOpen = signal(false);
  deleteEmployee = signal<EmployeeDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);
  canViewSalary = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);

  columns: ColumnDef[] = [
    { key: 'fullName', header: 'Ad Soyad', sortable: true },
    { key: 'nationalId', header: 'TC Kimlik', width: '140px' },
    { key: 'departmentName', header: 'Departman', width: '150px', sortable: true },
    { key: 'positionTitle', header: 'Pozisyon', width: '150px' },
    { key: 'status', header: 'Durum', width: '120px' },
    { key: 'salary', header: 'Maaş', width: '130px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Çalışan ara...', type: 'search' },
    {
      key: 'departmentId',
      label: 'Tüm Departmanlar',
      type: 'select',
      options: [],
    },
    {
      key: 'status',
      label: 'Tüm Durumlar',
      type: 'select',
      options: [
        { value: String(EmployeeStatus.Active), label: EmployeeStatusLabel[EmployeeStatus.Active] },
        { value: String(EmployeeStatus.OnLeave), label: EmployeeStatusLabel[EmployeeStatus.OnLeave] },
        { value: String(EmployeeStatus.Terminated), label: EmployeeStatusLabel[EmployeeStatus.Terminated] },
      ],
    },
  ];

  ngOnInit(): void {
    this.employeeService.loadEmployees(this.currentParams);
    this.loadDepartmentOptions();
  }

  ngAfterViewInit(): void {
    const sTpl = this.statusTpl();
    const salTpl = this.salaryTpl();

    this.columns = this.columns.map((col) => {
      if (col.key === 'status' && sTpl) return { ...col, template: sTpl };
      if (col.key === 'salary' && salTpl) return { ...col, template: salTpl };
      return col;
    });
  }

  private loadDepartmentOptions(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const deptFilter = this.filterDefs.find((f) => f.key === 'departmentId');
          if (deptFilter) {
            deptFilter.options = res.data.items.map((d) => ({
              value: d.id,
              label: d.name,
            }));
          }
        }
      },
    });
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      departmentId: filters['departmentId'] || undefined,
      status: filters['status'] || undefined,
    };
    this.employeeService.loadEmployees(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.employeeService.loadEmployees(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.employeeService.loadEmployees(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.employeeService.loadEmployees(this.currentParams);
  }

  openCreateForm(): void {
    this.editEmployee.set(null);
    this.formOpen.set(true);
  }

  openEditForm(row: Record<string, unknown>): void {
    this.editEmployee.set(row as unknown as EmployeeDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editEmployee.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.employeeService.loadEmployees(this.currentParams);
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.deleteEmployee.set(row as unknown as EmployeeDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const employee = this.deleteEmployee();
    if (!employee) return;

    this.employeeService.delete(employee.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${employee.fullName} başarıyla silindi`);
          this.employeeService.loadEmployees(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteEmployee.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Çalışan silinemedi');
        this.deleteOpen.set(false);
        this.deleteEmployee.set(null);
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
