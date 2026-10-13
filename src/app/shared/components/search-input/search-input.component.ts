import {
  Component,
  ChangeDetectionStrategy,
  output,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full sm:w-64">
      <i class="ph-light ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
      <input
        [formControl]="searchControl"
        placeholder="Ara..."
        class="w-full h-10 pl-9 pr-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors duration-150 motion-reduce:transition-none"
      />
      @if (searchControl.value) {
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
          (click)="clear()"
        >
          <i class="ph-light ph-x text-sm"></i>
        </button>
      }
    </div>
  `,
})
export class SearchInputComponent implements OnInit {
  searchChange = output<string>();

  searchControl = new FormControl('', { nonNullable: true });
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searchChange.emit(value));
  }

  clear(): void {
    this.searchControl.setValue('');
  }
}
