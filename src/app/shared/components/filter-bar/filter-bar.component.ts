import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectOption } from '../select/select.component';

export interface FilterDef {
  key: string;
  label: string;
  type: 'search' | 'select';
  options?: SelectOption[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      @for (filter of filters(); track filter.key) {
        @if (filter.type === 'search') {
          <div class="relative w-full sm:w-64">
            <i class="ph-light ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
            <input
              [formControl]="getSearchControl(filter.key)"
              [placeholder]="filter.label"
              class="w-full h-10 pl-9 pr-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
            />
            @if (getSearchControl(filter.key).value) {
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                (click)="clearFilter(filter.key)"
              >
                <i class="ph-light ph-x text-sm"></i>
              </button>
            }
          </div>
        } @else if (filter.type === 'select') {
          <div class="relative w-full sm:w-48">
            <select
              [formControl]="getSelectControl(filter.key)"
              class="w-full h-10 px-3 pr-8 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150"
            >
              <option value="">{{ filter.label }}</option>
              @for (opt of filter.options ?? []; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
            <i class="ph-light ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"></i>
          </div>
        }
      }

      @if (hasActiveFilters()) {
        <div class="flex items-center gap-2 flex-wrap">
          @for (badge of activeFilterBadges(); track badge.key) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--primary-soft)] text-[var(--primary)]">
              {{ badge.label }}
              <button type="button" class="hover:text-[var(--primary-hover)] cursor-pointer" (click)="clearFilter(badge.key)">
                <i class="ph-light ph-x text-xs"></i>
              </button>
            </span>
          }
          <button
            type="button"
            class="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
            (click)="clearAll()"
          >
            Temizle
          </button>
        </div>
      }
    </div>
  `,
})
export class FilterBarComponent implements OnInit {
  filters = input.required<FilterDef[]>();
  filterChange = output<Record<string, string>>();

  private controls = new Map<string, FormControl<string>>();
  private destroyRef = inject(DestroyRef);
  private currentValues = signal<Record<string, string>>({});

  ngOnInit(): void {
    for (const filter of this.filters()) {
      const control = new FormControl('', { nonNullable: true });
      this.controls.set(filter.key, control);

      const obs = filter.type === 'search'
        ? control.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
        : control.valueChanges.pipe(distinctUntilChanged());

      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
        this.currentValues.update((v) => ({ ...v, [filter.key]: value }));
        this.emitFilters();
      });
    }
  }

  getSearchControl(key: string): FormControl<string> {
    return this.controls.get(key)!;
  }

  getSelectControl(key: string): FormControl<string> {
    return this.controls.get(key)!;
  }

  clearFilter(key: string): void {
    this.controls.get(key)?.setValue('');
  }

  clearAll(): void {
    this.controls.forEach((control) => control.setValue(''));
  }

  hasActiveFilters(): boolean {
    return Object.values(this.currentValues()).some((v) => v !== '');
  }

  activeFilterBadges(): { key: string; label: string }[] {
    const badges: { key: string; label: string }[] = [];
    const vals = this.currentValues();
    for (const filter of this.filters()) {
      const v = vals[filter.key];
      if (!v) continue;
      if (filter.type === 'select') {
        const opt = filter.options?.find((o) => String(o.value) === v);
        badges.push({ key: filter.key, label: opt?.label ?? v });
      } else {
        badges.push({ key: filter.key, label: `"${v}"` });
      }
    }
    return badges;
  }

  private emitFilters(): void {
    const result: Record<string, string> = {};
    this.currentValues();
    this.controls.forEach((control, key) => {
      if (control.value) result[key] = control.value;
    });
    this.filterChange.emit(result);
  }
}
