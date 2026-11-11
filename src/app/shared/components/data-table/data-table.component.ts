import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  TemplateRef,
  ContentChild,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface ColumnDef {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  template?: TemplateRef<unknown>;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full overflow-x-auto rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <table class="w-full">
        <thead>
          <tr class="bg-[var(--bg-muted)]">
            @for (col of columns(); track col.key) {
              <th
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]"
                [style.width]="col.width ?? 'auto'"
                [style.min-width]="col.width ?? 'auto'"
              >
                @if (col.sortable) {
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
                    (click)="onSort(col.key)"
                  >
                    {{ col.header }}
                    @if (sortColumn() === col.key) {
                      <i [class]="sortDirection() === 'asc' ? 'ph-light ph-caret-up' : 'ph-light ph-caret-down'"></i>
                    } @else {
                      <i class="ph-light ph-caret-up-down text-[var(--text-muted)]"></i>
                    }
                  </button>
                } @else {
                  {{ col.header }}
                }
              </th>
            }
            @if (actionsTemplate) {
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                İşlem
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (_ of skeletonRows; track $index) {
              <tr class="border-t border-[var(--border)]">
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3">
                    <div class="h-4 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite]"></div>
                  </td>
                }
                @if (actionsTemplate) {
                  <td class="px-4 py-3">
                    <div class="h-4 w-16 rounded bg-[var(--bg-muted)] animate-[shimmer_1.5s_linear_infinite] ml-auto"></div>
                  </td>
                }
              </tr>
            }
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (actionsTemplate ? 1 : 0)" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <i class="ph-light ph-clipboard-text text-4xl text-[var(--text-muted)]"></i>
                  <p class="text-sm text-[var(--text-muted)]">{{ emptyMessage() }}</p>
                </div>
              </td>
            </tr>
          } @else {
            @for (row of data(); track $index) {
              <tr class="border-t border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors duration-150 motion-reduce:transition-none">
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3 text-[13px] text-[var(--text-primary)]">
                    @if (col.template) {
                      <ng-container
                        [ngTemplateOutlet]="col.template"
                        [ngTemplateOutletContext]="{ $implicit: row, row: row, value: row[col.key] }"
                      ></ng-container>
                    } @else {
                      {{ row[col.key] }}
                    }
                  </td>
                }
                @if (actionsTemplate) {
                  <td class="px-4 py-3 text-right">
                    <ng-container
                      [ngTemplateOutlet]="actionsTemplate"
                      [ngTemplateOutletContext]="{ $implicit: row, row: row }"
                    ></ng-container>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    :host [class*="animate-[shimmer"] {
      background: linear-gradient(90deg, var(--bg-muted) 25%, var(--bg-subtle) 50%, var(--bg-muted) 75%);
      background-size: 200% 100%;
    }
  `,
})
export class DataTableComponent {
  columns = input.required<ColumnDef[]>();
  data = input<Record<string, unknown>[]>([]);
  loading = input<boolean>(false);
  emptyMessage = input<string>('Kayıt bulunamadı');

  sortChange = output<SortEvent>();

  @ContentChild('actions') actionsTemplate?: TemplateRef<unknown>;

  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  skeletonRows = Array(5);

  onSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({ column: this.sortColumn(), direction: this.sortDirection() });
  }
}
