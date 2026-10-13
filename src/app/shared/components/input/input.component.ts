import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <label [for]="inputId()" class="text-[13px] font-medium text-[var(--text-primary)]">
          {{ label() }}
        </label>
      }
      <div class="relative">
        <input
          [id]="inputId()"
          [type]="showPassword() ? 'text' : type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="w-full h-10 px-3 rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none"
          [class.border-[var(--destructive)]]="error()"
          [class.border-[var(--border)]]="!error()"
        />
        @if (type() === 'password') {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150 cursor-pointer"
            (click)="showPassword.set(!showPassword())"
          >
            <i [class]="showPassword() ? 'ph-light ph-eye-slash text-lg' : 'ph-light ph-eye text-lg'"></i>
          </button>
        }
      </div>
      @if (error()) {
        <span class="text-xs text-[var(--destructive)]">{{ error() }}</span>
      } @else if (helper()) {
        <span class="text-xs text-[var(--text-muted)]">{{ helper() }}</span>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel'>('text');
  placeholder = input<string>('');
  helper = input<string>('');
  error = input<string>('');
  inputId = input<string>('input-' + Math.random().toString(36).slice(2, 9));

  value = signal('');
  isDisabled = signal(false);
  showPassword = signal(false);

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
