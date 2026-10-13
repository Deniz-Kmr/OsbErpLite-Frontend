import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      <!-- Info -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-[var(--text-secondary)]">
          <span class="font-mono font-semibold text-[var(--text-primary)]">{{ rangeStart() }} - {{ rangeEnd() }}</span>
          /
          <span class="font-mono font-semibold text-[var(--text-primary)]">{{ totalCount() }}</span>
          gösteriliyor
        </span>
        <select
          class="h-8 px-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          [value]="pageSize()"
          (change)="onPageSizeChange($event)"
        >
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
      </div>

      <!-- Pages -->
      <nav class="flex items-center gap-1" aria-label="Sayfalama">
        <button
          type="button"
          class="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          [disabled]="currentPage() <= 1"
          (click)="goToPage(currentPage() - 1)"
          aria-label="Önceki sayfa"
        >
          <i class="ph-light ph-caret-left"></i>
        </button>

        @for (page of pages(); track page) {
          @if (page === -1) {
            <span class="h-8 w-8 flex items-center justify-center text-sm text-[var(--text-muted)]">…</span>
          } @else {
            <button
              type="button"
              class="h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
              [class.bg-[var(--primary)]]="page === currentPage()"
              [class.text-white]="page === currentPage()"
              [class.text-[var(--text-secondary)]]="page !== currentPage()"
              [class.hover:bg-[var(--bg-muted)]]="page !== currentPage()"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button
          type="button"
          class="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          [disabled]="currentPage() >= totalPages()"
          (click)="goToPage(currentPage() + 1)"
          aria-label="Sonraki sayfa"
        >
          <i class="ph-light ph-caret-right"></i>
        </button>
      </nav>
    </div>
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageSize = input<number>(10);
  totalCount = input<number>(0);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  rangeStart = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
  }
}
