import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole } from '@core/models/enums';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)] px-4 py-8">
      <!-- Theme toggle -->
      <button
        (click)="themeService.toggle()"
        class="fixed right-4 top-4 flex h-10 w-10 items-center justify-center
               rounded-lg text-[var(--text-muted)] transition-colors duration-150
               hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]
               focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        [attr.aria-label]="themeService.isDark() ? 'Acik temaya gec' : 'Koyu temaya gec'"
      >
        @if (themeService.isDark()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,60a68,68,0,1,0,68,68A68.07,68.07,0,0,0,128,60Zm0,124a56,56,0,1,1,56-56A56.06,56.06,0,0,1,128,184ZM122,36V16a6,6,0,0,1,12,0V36a6,6,0,0,1-12,0Zm90.49,48.49a6,6,0,0,1-8.49,0l-14.14-14.14a6,6,0,0,1,8.49-8.49L212.49,76A6,6,0,0,1,212.49,84.49ZM246,128a6,6,0,0,1-6,6H220a6,6,0,0,1,0-12h20A6,6,0,0,1,246,128Zm-33.51,43.51L226.63,185.65a6,6,0,0,1-8.49,8.49l-14.14-14.14a6,6,0,0,1,8.49-8.49ZM134,220v20a6,6,0,0,1-12,0V220a6,6,0,0,1,12,0ZM43.51,171.51a6,6,0,0,1,8.49,0l14.14,14.14a6,6,0,0,1-8.49,8.49L43.51,180A6,6,0,0,1,43.51,171.51ZM10,128a6,6,0,0,1,6-6H36a6,6,0,0,1,0,12H16A6,6,0,0,1,10,128ZM43.51,84.49,29.37,70.35a6,6,0,0,1,8.49-8.49L52,76a6,6,0,0,1-8.49,8.49Z"/>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M230.72,150.46a6,6,0,0,0-5.89-1.68A97.3,97.3,0,0,1,200,152a98.11,98.11,0,0,1-98-98,97.3,97.3,0,0,1,3.22-24.83,6,6,0,0,0-7.57-7.57A102,102,0,1,0,238.29,162,6,6,0,0,0,230.72,150.46ZM128,218A90,90,0,0,1,109.51,40a104.18,104.18,0,0,0,6.49,78,104.18,104.18,0,0,0,78,6.49A90.1,90.1,0,0,1,128,218Z"/>
          </svg>
        }
      </button>

      <div class="w-full max-w-[420px]">
        <!-- Logo / Brand -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
                      bg-[var(--primary)] shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 256 256">
              <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V98H38V56A2,2,0,0,1,40,54ZM216,202H40a2,2,0,0,1-2-2V110H218v90A2,2,0,0,1,216,202Z"/>
            </svg>
          </div>
          <h1 class="text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--text-primary)]">
            Kayit Ol
          </h1>
          <p class="mt-1 text-sm text-[var(--text-muted)]">
            Yeni kullanici hesabi olusturun
          </p>
        </div>

        <!-- Form Card -->
        <div class="rounded-2xl bg-[var(--bg-surface)] p-8
                    shadow-[0_4px_6px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)]
                    ring-1 ring-[var(--border)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Username -->
            <div class="mb-4">
              <label
                for="reg-username"
                class="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]"
              >
                Kullanici Adi
              </label>
              <input
                id="reg-username"
                type="text"
                formControlName="username"
                autocomplete="username"
                class="h-11 w-full rounded-lg border bg-transparent px-3.5
                       text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-muted)]
                       transition-colors duration-150
                       focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                [class.border-[var(--destructive)]]="showError('username')"
                [class.border-[var(--border)]]="!showError('username')"
                placeholder="Kullanici adi belirleyin"
              />
              @if (showError('username')) {
                <p class="mt-1 text-xs text-[var(--destructive)]">
                  Kullanici adi zorunludur
                </p>
              }
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label
                for="reg-password"
                class="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]"
              >
                Sifre
              </label>
              <div class="relative">
                <input
                  id="reg-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="new-password"
                  class="h-11 w-full rounded-lg border bg-transparent px-3.5 pr-11
                         text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-muted)]
                         transition-colors duration-150
                         focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                  [class.border-[var(--destructive)]]="showError('password')"
                  [class.border-[var(--border)]]="!showError('password')"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]
                         transition-colors duration-150 hover:text-[var(--text-secondary)]
                         focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none
                         rounded"
                  [attr.aria-label]="showPassword() ? 'Sifreyi gizle' : 'Sifreyi goster'"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M53.92,34.62A6,6,0,1,0,45.08,42.38L61.32,60.22A133.48,133.48,0,0,0,24.93,120.39a6,6,0,0,0,0,7.22C34.58,141.44,76.05,190,128,190a123.11,123.11,0,0,0,52.57-11.78l21.51,23.66a6,6,0,0,0,8.84-8.12ZM128,178c-43.18,0-78.62-39.82-91.08-55.47A121.58,121.58,0,0,1,70.66,72.6l22.54,24.8A42,42,0,0,0,128,170a41.53,41.53,0,0,0,16.6-3.42l18,19.82A111.18,111.18,0,0,1,128,178Zm-5.28-60.88a30,30,0,0,0,36.16,39.78Zm108.35,10.49a134.7,134.7,0,0,1-19.4,28.14,6,6,0,0,1-9.06-7.88A122.26,122.26,0,0,0,219.08,122.53,121.44,121.44,0,0,0,165,73.31a6,6,0,0,1-2.64-11.72A133.52,133.52,0,0,1,231.07,120.39,6,6,0,0,1,231.07,127.61Zm-75.53-40.33a6,6,0,0,1,.71-8.45,41.66,41.66,0,0,1,16.89-8.61,6,6,0,1,1,3.32,11.54,29.75,29.75,0,0,0-12.47,6.37,6,6,0,0,1-8.45-.85Z"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M245.48,125.57C231.77,104.48,189.76,54,128,54S24.23,104.48,10.52,125.57a14,14,0,0,0,0,14.86C24.23,161.52,66.24,212,128,212s103.77-50.48,117.48-71.57A14,14,0,0,0,245.48,125.57ZM128,200c-56.34,0-95.27-45.87-107.12-62a2,2,0,0,1,0-2.12C32.73,119.87,71.66,74,128,74s95.27,45.87,107.12,62a2,2,0,0,1,0,2.12C223.27,154.13,184.34,200,128,200Zm0-112a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,68a28,28,0,1,1,28-28A28,28,0,0,1,128,156Z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (showError('password')) {
                <p class="mt-1 text-xs text-[var(--destructive)]">
                  @if (form.get('password')?.errors?.['required']) {
                    Sifre zorunludur
                  } @else if (form.get('password')?.errors?.['minlength']) {
                    Sifre en az 6 karakter olmalidir
                  }
                </p>
              }
            </div>

            <!-- Confirm Password -->
            <div class="mb-4">
              <label
                for="reg-confirm"
                class="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]"
              >
                Sifre Tekrar
              </label>
              <input
                id="reg-confirm"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="confirmPassword"
                autocomplete="new-password"
                class="h-11 w-full rounded-lg border bg-transparent px-3.5
                       text-sm text-[var(--text-primary)]
                       placeholder:text-[var(--text-muted)]
                       transition-colors duration-150
                       focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                [class.border-[var(--destructive)]]="showError('confirmPassword') || showMismatchError()"
                [class.border-[var(--border)]]="!showError('confirmPassword') && !showMismatchError()"
                placeholder="Sifreyi tekrar girin"
              />
              @if (showError('confirmPassword')) {
                <p class="mt-1 text-xs text-[var(--destructive)]">
                  Sifre tekrari zorunludur
                </p>
              } @else if (showMismatchError()) {
                <p class="mt-1 text-xs text-[var(--destructive)]">
                  Sifreler eslesmeli
                </p>
              }
            </div>

            <!-- Role -->
            <div class="mb-4">
              <label
                for="reg-role"
                class="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]"
              >
                Rol
              </label>
              <select
                id="reg-role"
                formControlName="role"
                class="h-11 w-full appearance-none rounded-lg border bg-transparent px-3.5
                       text-sm text-[var(--text-primary)]
                       transition-colors duration-150
                       focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                [class.border-[var(--destructive)]]="showError('role')"
                [class.border-[var(--border)]]="!showError('role')"
              >
                <option value="" disabled class="text-[var(--text-muted)]">Rol secin</option>
                <option [value]="UserRole.Admin">Admin</option>
                <option [value]="UserRole.Manager">Yonetici</option>
                <option [value]="UserRole.Employee">Calisan</option>
              </select>
              @if (showError('role')) {
                <p class="mt-1 text-xs text-[var(--destructive)]">
                  Rol secimi zorunludur
                </p>
              }
            </div>

            <!-- EmployeeId (optional, shown when Employee selected) -->
            @if (form.get('role')?.value == UserRole.Employee) {
              <div class="mb-4">
                <label
                  for="reg-employee"
                  class="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]"
                >
                  Calisan ID
                  <span class="font-normal text-[var(--text-muted)]">(opsiyonel)</span>
                </label>
                <input
                  id="reg-employee"
                  type="text"
                  formControlName="employeeId"
                  class="h-11 w-full rounded-lg border border-[var(--border)] bg-transparent px-3.5
                         text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-muted)]
                         transition-colors duration-150
                         focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                  placeholder="Mevcut calisan kaydina bagla"
                />
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="mt-2 flex h-12 w-full items-center justify-center rounded-[0.625rem]
                     bg-[var(--primary)] text-sm font-semibold text-white
                     transition-colors duration-150
                     hover:bg-[var(--primary-hover)]
                     focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2
                     focus-visible:outline-none
                     disabled:cursor-not-allowed disabled:opacity-50"
            >
              @if (loading()) {
                <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              } @else {
                Kayit Ol
              }
            </button>
          </form>

          <p class="mt-5 text-center text-[13px] text-[var(--text-muted)]">
            Zaten hesabiniz var mi?
            <a
              routerLink="/auth/login"
              class="font-medium text-[var(--primary)] transition-colors duration-150
                     hover:text-[var(--primary-hover)]
                     focus-visible:outline-none focus-visible:underline"
            >
              Giris Yap
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly themeService = inject(ThemeService);

  readonly UserRole = UserRole;
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  submitted = false;

  readonly form: FormGroup = this.fb.group(
    {
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      employeeId: [''],
    },
    { validators: this.passwordMatchValidator },
  );

  showError(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  showMismatchError(): boolean {
    return (
      this.form.hasError('passwordMismatch') &&
      (this.form.get('confirmPassword')?.touched || this.submitted) &&
      !this.form.get('confirmPassword')?.errors
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading.set(true);
    const { username, password, role, employeeId } = this.form.value;
    this.authService
      .register({
        username,
        password,
        role: Number(role),
        employeeId: employeeId || undefined,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Kayit basarili! Giris yapabilirsiniz.');
            this.router.navigate(['/auth/login']);
          } else {
            this.toastService.error(res.message ?? 'Kayit basarisiz');
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.toastService.error(
            err.error?.message ?? 'Kayit sirasinda bir hata olustu',
          );
          this.loading.set(false);
        },
      });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
