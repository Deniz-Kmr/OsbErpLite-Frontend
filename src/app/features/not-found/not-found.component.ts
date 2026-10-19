import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div class="text-center space-y-6">
        <span class="block font-mono text-[120px] font-extrabold leading-none text-[var(--primary)] opacity-20 select-none">
          404
        </span>
        <div class="space-y-2">
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">Sayfa Bulunamadı</h1>
          <p class="text-sm text-[var(--text-secondary)]">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <a routerLink="/dashboard">
          <app-button icon="house">Dashboard'a Dön</app-button>
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
