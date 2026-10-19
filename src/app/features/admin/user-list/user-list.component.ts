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

import { UserService } from '../user.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, UserRoleLabel } from '@core/models/enums';
import { UserDto } from '@core/models/dto/user.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { PasswordResetComponent } from '../user-form/password-reset.component';

@Component({
  selector: 'app-user-list',
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
    UserFormComponent,
    PasswordResetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Kullanıcı Yönetimi</h1>
        <app-button icon="plus" (clicked)="openCreateForm()">
          Yeni Kullanıcı
        </app-button>
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((userService.loading$ | async) === false && (userService.users$ | async)?.length === 0) {
        <app-empty-state
          icon="users-three"
          message="Henüz kullanıcı eklenmemiş"
          actionLabel="Yeni Ekle"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((userService.users$ | async) ?? [])"
          [loading]="(userService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #roleTpl let-row>
            <app-badge variant="role" [value]="row['role']" [label]="getRoleLabel(row['role'])" />
          </ng-template>

          <ng-template #statusTpl let-row>
            <span
              class="inline-flex items-center gap-1 text-xs font-medium"
              [class]="row['isActive']
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'"
            >
              <i [class]="row['isActive'] ? 'ph-light ph-check-circle' : 'ph-light ph-x-circle'" class="text-sm"></i>
              {{ row['isActive'] ? 'Aktif' : 'Pasif' }}
            </span>
          </ng-template>

          <ng-template #actions let-row>
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors duration-150 cursor-pointer"
                (click)="openEditForm(row)"
                aria-label="Düzenle"
              >
                <i class="ph-light ph-pencil-simple text-lg"></i>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors duration-150 cursor-pointer"
                (click)="openPasswordReset(row)"
                aria-label="Şifre Sıfırla"
              >
                <i class="ph-light ph-key text-lg"></i>
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150 cursor-pointer"
                (click)="confirmDelete(row)"
                aria-label="Sil"
              >
                <i class="ph-light ph-trash text-lg"></i>
              </button>
            </div>
          </ng-template>
        </app-data-table>

        @if (userService.pagination$ | async; as pagination) {
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
    <app-user-form
      [open]="formOpen()"
      [editData]="editUser()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Password Reset Modal -->
    <app-password-reset
      [open]="passwordOpen()"
      [user]="passwordUser()"
      (closed)="passwordOpen.set(false)"
      (saved)="passwordOpen.set(false)"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Kullanıcı Sil"
      [message]="deleteUser() ? deleteUser()!.username + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class UserListComponent implements OnInit, AfterViewInit {
  readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly roleTpl = viewChild<TemplateRef<unknown>>('roleTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');

  formOpen = signal(false);
  editUser = signal<UserDto | null>(null);
  deleteOpen = signal(false);
  deleteUser = signal<UserDto | null>(null);
  passwordOpen = signal(false);
  passwordUser = signal<UserDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  columns: ColumnDef[] = [
    { key: 'username', header: 'Kullanıcı Adı', sortable: true },
    { key: 'role', header: 'Rol', width: '140px' },
    { key: 'isActive', header: 'Durum', width: '100px' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Kullanıcı ara...', type: 'search' },
    {
      key: 'role',
      label: 'Tüm Roller',
      type: 'select',
      options: [
        { value: String(UserRole.Admin), label: UserRoleLabel[UserRole.Admin] },
        { value: String(UserRole.Manager), label: UserRoleLabel[UserRole.Manager] },
        { value: String(UserRole.Employee), label: UserRoleLabel[UserRole.Employee] },
      ],
    },
  ];

  ngOnInit(): void {
    this.userService.loadUsers(this.currentParams);
  }

  ngAfterViewInit(): void {
    const rTpl = this.roleTpl();
    const sTpl = this.statusTpl();

    this.columns = this.columns.map((col) => {
      if (col.key === 'role' && rTpl) return { ...col, template: rTpl };
      if (col.key === 'isActive' && sTpl) return { ...col, template: sTpl };
      return col;
    });
  }

  getRoleLabel(role: UserRole): string {
    return UserRoleLabel[role] ?? 'Bilinmiyor';
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      role: filters['role'] || undefined,
    };
    this.userService.loadUsers(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.userService.loadUsers(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.userService.loadUsers(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.userService.loadUsers(this.currentParams);
  }

  openCreateForm(): void {
    this.editUser.set(null);
    this.formOpen.set(true);
  }

  openEditForm(row: Record<string, unknown>): void {
    this.editUser.set(row as unknown as UserDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editUser.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.userService.loadUsers(this.currentParams);
  }

  openPasswordReset(row: Record<string, unknown>): void {
    this.passwordUser.set(row as unknown as UserDto);
    this.passwordOpen.set(true);
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.deleteUser.set(row as unknown as UserDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const user = this.deleteUser();
    if (!user) return;

    this.userService.delete(user.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${user.username} başarıyla silindi`);
          this.userService.loadUsers(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deleteUser.set(null);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Kullanıcı silinemedi');
        this.deleteOpen.set(false);
        this.deleteUser.set(null);
      },
    });
  }
}
