import { Injectable, signal, effect } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  readonly preference = signal<ThemePreference>(this.loadPreference());
  readonly isDark = signal(false);

  constructor() {
    this.applyTheme(this.preference());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.preference() === 'system') {
        this.applyTheme('system');
      }
    });

    effect(() => {
      const pref = this.preference();
      localStorage.setItem(this.STORAGE_KEY, pref);
      this.applyTheme(pref);
    });
  }

  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }

  setPreference(pref: ThemePreference): void {
    this.preference.set(pref);
  }

  private loadPreference(): ThemePreference {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private applyTheme(pref: ThemePreference): void {
    const dark =
      pref === 'dark' ||
      (pref === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.isDark.set(dark);
    document.body.classList.toggle('dark', dark);
  }
}
