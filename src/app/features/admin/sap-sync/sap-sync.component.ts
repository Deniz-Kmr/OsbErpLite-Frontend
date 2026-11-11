import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';

import { UserService } from '../user.service';
import { ToastService } from '@shared/components/toast/toast.service';

import { ButtonComponent } from '@shared/components/button/button.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sap-sync',
  standalone: true,
  imports: [ButtonComponent, CardComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">SAP Entegrasyonu</h1>

      <app-card>
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center">
            <i class="ph-light ph-arrows-clockwise text-2xl text-[var(--primary)]"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-base font-semibold text-[var(--text-primary)]">İş Ortağı Senkronizasyonu</h3>
            <p class="text-sm text-[var(--text-secondary)] mt-0.5">
              SAP sisteminden iş ortaklarını senkronize edin. Bu işlem birkaç dakika sürebilir.
            </p>
          </div>
          <app-button
            icon="arrows-clockwise"
            [loading]="syncing()"
            (clicked)="confirmOpen.set(true)"
          >
            Senkronizasyonu Başlat
          </app-button>
        </div>
      </app-card>
    </div>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="SAP Senkronizasyonu"
      message="SAP iş ortağı senkronizasyonu başlatılacak. Devam etmek istiyor musunuz?"
      confirmLabel="Başlat"
      confirmVariant="primary"
      (confirm)="onSync()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
})
export class SapSyncComponent {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  syncing = signal(false);
  confirmOpen = signal(false);

  onSync(): void {
    this.confirmOpen.set(false);
    this.syncing.set(true);

    this.userService.triggerSapSync().subscribe({
      next: (res) => {
        this.syncing.set(false);
        if (res.success) {
          this.toastService.success('SAP senkronizasyonu başarıyla tamamlandı');
        } else {
          this.toastService.error(res.message ?? 'Senkronizasyon başarısız');
        }
      },
      error: (err) => {
        this.syncing.set(false);
        this.toastService.error(err.error?.message ?? 'Senkronizasyon sırasında hata oluştu');
      },
    });
  }
}
