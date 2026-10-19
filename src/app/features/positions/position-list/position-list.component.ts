import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { PositionService } from '../position.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole } from '@core/models/enums';
import { PositionDto } from '@core/models/dto/position.dto';
import { QueryParams } from '@core/models/paginated-list.model';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { PositionFormComponent } from '../position-form/position-form.component';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    ButtonComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    PositionFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Pozisyonlar</h1>
        @if (canCreate) {
          <app-button icon="plus" (clicked)="openCreateForm()">
            Yeni Pozisyon
          </app-button>
        }
      </div>

      <!-- Filters -->
      <app-filter-bar
        [filters]="filterDefs"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Table -->
      @if ((positionService.loading$ | async) === false && (positionService.positions$ | async)?.length === 0) {
        <app-empty-state
          icon="identification-badge"
          message="Henüz pozisyon eklenmemiş"
          [actionLabel]="canCreate ? 'Yeni Ekle' : ''"
          (action)="openCreateForm()"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((positionService.positions$ | async) ?? [])"
          [loading]="(positionService.loading$ | async) ?? false"
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

        @if (positionService.pagination$ | async; as pagination) {
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
    <app-position-form
      [open]="formOpen()"
      [editData]="editPosition()"
      (closed)="closeForm()"
      (saved)="onSaved()"
    />

    <!-- Delete Confirm -->
    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Pozisyon Sil"
      [message]="deletePosition() ? deletePosition()!.title + ' silinecek. Bu işlem geri alınamaz.' : ''"
      confirmLabel="Sil"
      (confirm)="onDeleteConfirm()"
      (cancel)="deleteOpen.set(false)"
    />
  `,
})
export class PositionListComponent implements OnInit {
  readonly positionService = inject(PositionService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  formOpen = signal(false);
  editPosition = signal<PositionDto | null>(null);
  deleteOpen = signal(false);
  deletePosition = signal<PositionDto | null>(null);

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  canCreate = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canDelete = this.authService.hasRole([UserRole.Admin]);

  columns: ColumnDef[] = [
    { key: 'title', header: 'Pozisyon Adı', sortable: true },
    { key: 'level', header: 'Seviye', sortable: true },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Pozisyon ara...', type: 'search' },
  ];

  ngOnInit(): void {
    this.positionService.loadPositions(this.currentParams);
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
    };
    this.positionService.loadPositions(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.positionService.loadPositions(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.positionService.loadPositions(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.positionService.loadPositions(this.currentParams);
  }

  openCreateForm(): void {
    this.editPosition.set(null);
    this.formOpen.set(true);
  }

  openEditForm(position: Record<string, unknown>): void {
    this.editPosition.set(position as unknown as PositionDto);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editPosition.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.positionService.loadPositions(this.currentParams);
  }

  confirmDelete(position: Record<string, unknown>): void {
    this.deletePosition.set(position as unknown as PositionDto);
    this.deleteOpen.set(true);
  }

  onDeleteConfirm(): void {
    const position = this.deletePosition();
    if (!position) return;

    this.positionService.delete(position.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`${position.title} başarıyla silindi`);
          this.positionService.loadPositions(this.currentParams);
        } else {
          this.toastService.error(res.message ?? 'Silme işlemi başarısız');
        }
        this.deleteOpen.set(false);
        this.deletePosition.set(null);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Bu pozisyonda aktif çalışanlar var, silinemez';
        this.toastService.error(msg);
        this.deleteOpen.set(false);
        this.deletePosition.set(null);
      },
    });
  }
}
