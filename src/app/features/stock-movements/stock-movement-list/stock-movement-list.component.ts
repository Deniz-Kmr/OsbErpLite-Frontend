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
import { FormsModule } from '@angular/forms';

import { StockMovementService } from '../stock-movement.service';
import { QueryParams } from '@core/models/paginated-list.model';
import { StockMovementType, StockMovementTypeLabel } from '@core/models/enums';

import { DataTableComponent, ColumnDef } from '@shared/components/data-table/data-table.component';
import { FilterBarComponent, FilterDef } from '@shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    DataTableComponent,
    FilterBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Stok Hareketleri</h1>
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
      @if ((movementService.loading$ | async) === false && (movementService.movements$ | async)?.length === 0) {
        <app-empty-state
          icon="arrows-left-right"
          message="Henüz stok hareketi bulunmuyor"
        />
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="$any((movementService.movements$ | async) ?? [])"
          [loading]="(movementService.loading$ | async) ?? false"
          (sortChange)="onSort($event)"
        >
          <ng-template #dateTpl let-row>
            <span class="text-sm text-[var(--text-primary)]">
              {{ row['date'] | date:'dd.MM.yyyy' }}
            </span>
          </ng-template>

          <ng-template #quantityTpl let-row>
            <span class="font-mono text-[13px] font-semibold">
              {{ row['quantity'] }}
            </span>
          </ng-template>

          <ng-template #typeTpl let-row>
            <app-badge variant="stock" [value]="row['movementType']" [label]="row['movementTypeName']" />
          </ng-template>

          <ng-template #noteTpl let-row>
            @if (row['note']) {
              <span class="text-sm text-[var(--text-secondary)]">{{ row['note'] }}</span>
            } @else {
              <span class="text-sm text-[var(--text-muted)]">—</span>
            }
          </ng-template>
        </app-data-table>

        @if (movementService.pagination$ | async; as pagination) {
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
  `,
})
export class StockMovementListComponent implements OnInit, AfterViewInit {
  readonly movementService = inject(StockMovementService);

  readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  readonly quantityTpl = viewChild<TemplateRef<unknown>>('quantityTpl');
  readonly typeTpl = viewChild<TemplateRef<unknown>>('typeTpl');
  readonly noteTpl = viewChild<TemplateRef<unknown>>('noteTpl');

  startDate = signal('');
  endDate = signal('');

  private currentParams: QueryParams = { pageNumber: 1, pageSize: 10 };

  columns: ColumnDef[] = [
    { key: 'date', header: 'Tarih', width: '130px', sortable: true },
    { key: 'productName', header: 'Ürün Adı', sortable: true },
    { key: 'quantity', header: 'Miktar', width: '100px', sortable: true },
    { key: 'movementType', header: 'Tip', width: '120px' },
    { key: 'note', header: 'Not' },
  ];

  filterDefs: FilterDef[] = [
    { key: 'search', label: 'Ürün ara...', type: 'search' },
    {
      key: 'movementType',
      label: 'Tümü',
      type: 'select',
      options: [
        { value: StockMovementType.In, label: StockMovementTypeLabel[StockMovementType.In] },
        { value: StockMovementType.Out, label: StockMovementTypeLabel[StockMovementType.Out] },
      ],
    },
  ];

  ngOnInit(): void {
    this.movementService.loadMovements(this.currentParams);
  }

  ngAfterViewInit(): void {
    const dTpl = this.dateTpl();
    const qTpl = this.quantityTpl();
    const tTpl = this.typeTpl();
    const nTpl = this.noteTpl();

    this.columns = this.columns.map((col) => {
      if (col.key === 'date' && dTpl) return { ...col, template: dTpl };
      if (col.key === 'quantity' && qTpl) return { ...col, template: qTpl };
      if (col.key === 'movementType' && tTpl) return { ...col, template: tTpl };
      if (col.key === 'note' && nTpl) return { ...col, template: nTpl };
      return col;
    });
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      search: filters['search'] || undefined,
      movementType: filters['movementType'] || undefined,
    };
    this.movementService.loadMovements(this.currentParams);
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      startDate: value || undefined,
    };
    this.movementService.loadMovements(this.currentParams);
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    this.currentParams = {
      ...this.currentParams,
      pageNumber: 1,
      endDate: value || undefined,
    };
    this.movementService.loadMovements(this.currentParams);
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
    this.movementService.loadMovements(this.currentParams);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: event.column,
      sortOrder: event.direction,
    };
    this.movementService.loadMovements(this.currentParams);
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: page };
    this.movementService.loadMovements(this.currentParams);
  }

  onPageSizeChange(size: number): void {
    this.currentParams = { ...this.currentParams, pageNumber: 1, pageSize: size };
    this.movementService.loadMovements(this.currentParams);
  }
}
