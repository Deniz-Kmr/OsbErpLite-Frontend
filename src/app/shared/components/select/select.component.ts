import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <label [for]="selectId()" class="text-[13px] font-medium text-[var(--text-primary)]">
          {{ label() }}
        </label>
      }
      <div class="relative">
        <select
          [id]="selectId()"
          [disabled]="isDisabled()"
          [value]="value()"
          (change)="onSelect($event)"
          (blur)="onTouched()"
          class="w-full h-10 px-3 pr-8 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] appearance-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer motion-reduce:transition-none"
          [class.border-[var(--destructive)]]="error()"
          [class.border-[var(--border)]]="!error()"
          [class.text-[var(--text-muted)]]="!value()"
        >
          @if (placeholder()) {
            <option value="" disabled>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <i class="ph-light ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"></i>
      </div>
      @if (error()) {
        <span class="text-xs text-[var(--destructive)]">{{ error() }}</span>
      } @else if (helper()) {
        <span class="text-xs text-[var(--text-muted)]">{{ helper() }}</span>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  options = input<SelectOption[]>([]);
  helper = input<string>('');
  error = input<string>('');
  selectId = input<string>('select-' + Math.random().toString(36).slice(2, 9));

  value = signal<string | number>('');
  isDisabled = signal(false);

  private onChange: (value: string | number) => void = () => {};
  onTouched: () => void = () => {};

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(value: string | number): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
