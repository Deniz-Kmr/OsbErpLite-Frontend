import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SalesOrderService } from '../sales-order.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { UserRole, OrderStatus, OrderStatusLabel } from '@core/models/enums';
import { SalesOrderDto } from '@core/models/dto/sales-order.dto';

import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="space-y-4 animate-pulse">
        <div class="h-8 w-64 rounded-lg bg-[var(--bg-muted)]"></div>
        <div class="h-48 rounded-2xl bg-[var(--bg-muted)]"></div>
        <div class="h-64 rounded-2xl bg-[var(--bg-muted)]"></div>
      </div>
    } @else if (order()) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">
              Sipariş Detayı
            </h1>
            <app-badge
              variant="order"
              [value]="order()!.status"
              [label]="order()!.statusName"
            />
          </div>
          <app-button variant="secondary" icon="arrow-left" (clicked)="goBack()">
            Geri
          </app-button>
        </div>

        <!-- Order Info Card -->
        <div class="rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Müşteri</p>
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ order()!.customerName }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Sipariş Tarihi</p>
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ order()!.orderDate | date:'dd.MM.yyyy' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Toplam Tutar</p>
              <p class="font-mono text-lg font-bold text-[var(--text-primary)]">{{ formatCurrency(order()!.totalAmount) }}</p>
            </div>
            @if (order()!.approvedByEmployeeName) {
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Onaylayan</p>
                <p class="text-sm font-semibold text-[var(--text-primary)]">{{ order()!.approvedByEmployeeName }}</p>
              </div>
            }
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Oluşturulma</p>
              <p class="text-sm text-[var(--text-secondary)]">{{ order()!.createdDate | date:'dd.MM.yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        <!-- Order Lines -->
        <div class="rounded-2xl bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
          <div class="px-6 py-4 border-b border-[var(--border)]">
            <h2 class="text-base font-semibold text-[var(--text-primary)]">Ürün Satırları</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-[var(--bg-muted)]">
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Ürün</th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">SKU</th>
                  <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] w-24">Miktar</th>
                  <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] w-32">Birim Fiyat</th>
                  <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] w-36">Satır Toplamı</th>
                </tr>
              </thead>
              <tbody>
                @for (line of order()!.lines; track line.id) {
                  <tr class="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-muted)] transition-colors duration-150">
                    <td class="px-4 py-3 text-sm text-[var(--text-primary)]">{{ line.productName }}</td>
                    <td class="px-4 py-3 text-sm text-[var(--text-secondary)]">{{ line.productSKU }}</td>
                    <td class="px-4 py-3 text-right font-mono text-[13px] font-semibold text-[var(--text-primary)]">{{ line.quantity }}</td>
                    <td class="px-4 py-3 text-right font-mono text-[13px] text-[var(--text-primary)]">{{ formatCurrency(line.unitPrice) }}</td>
                    <td class="px-4 py-3 text-right font-mono text-[13px] font-semibold text-[var(--text-primary)]">{{ formatCurrency(line.lineTotal) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="bg-[var(--bg-muted)]">
                  <td colspan="4" class="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)]">Genel Toplam</td>
                  <td class="px-4 py-3 text-right font-mono text-base font-bold text-[var(--text-primary)]">{{ formatCurrency(order()!.totalAmount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Lifecycle Actions -->
        <div class="flex flex-wrap items-center gap-3">
          @if (order()!.status === draftStatus) {
            <app-button variant="primary" icon="paper-plane-tilt" (clicked)="openConfirm('pending')">
              Onaya Gönder
            </app-button>
          }

          @if (order()!.status === pendingStatus && canApprove) {
            <app-button
              variant="primary"
              icon="check-circle"
              class="[&_button]:bg-[var(--success)] [&_button]:hover:bg-emerald-600"
              (clicked)="openConfirm('approved')"
            >
              Onayla
            </app-button>
            <app-button variant="destructive" icon="x-circle" (clicked)="openConfirm('rejected')">
              Reddet
            </app-button>
          }

          @if (order()!.status === approvedStatus && canApprove) {
            <app-button variant="primary" icon="check" (clicked)="openConfirm('completed')">
              Tamamla
            </app-button>
          }

          @if (order()!.status === draftStatus && canEdit) {
            <app-button variant="secondary" icon="pencil-simple" (clicked)="navigateToEdit()">
              Düzenle
            </app-button>
          }
        </div>
      </div>

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        [open]="confirmOpen()"
        [title]="confirmTitle()"
        [message]="confirmMessage()"
        [confirmLabel]="confirmLabel()"
        [confirmVariant]="confirmVariant()"
        (confirm)="onConfirmAction()"
        (cancel)="confirmOpen.set(false)"
      />
    }
  `,
})
export class SalesOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(SalesOrderService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  order = signal<SalesOrderDto | null>(null);
  loading = signal(true);
  confirmOpen = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmLabel = signal('');
  confirmVariant = signal<'primary' | 'destructive'>('primary');

  readonly draftStatus = OrderStatus.Draft;
  readonly pendingStatus = OrderStatus.Pending;
  readonly approvedStatus = OrderStatus.Approved;

  canApprove = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);
  canEdit = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);

  private pendingAction: OrderStatus | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    this.orderService.getById(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.order.set(res.data);
        } else {
          this.toastService.error('Sipariş bulunamadı');
          this.router.navigate(['/sales-orders']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Sipariş yüklenemedi');
        this.router.navigate(['/sales-orders']);
      },
    });
  }

  openConfirm(action: 'pending' | 'approved' | 'rejected' | 'completed'): void {
    const configs: Record<string, { status: OrderStatus; title: string; message: string; label: string; variant: 'primary' | 'destructive' }> = {
      pending: {
        status: OrderStatus.Pending,
        title: 'Onaya Gönder',
        message: 'Bu sipariş onaya gönderilecek. Devam etmek istiyor musunuz?',
        label: 'Gönder',
        variant: 'primary',
      },
      approved: {
        status: OrderStatus.Approved,
        title: 'Siparişi Onayla',
        message: 'Bu sipariş onaylanacak. Devam etmek istiyor musunuz?',
        label: 'Onayla',
        variant: 'primary',
      },
      rejected: {
        status: OrderStatus.Rejected,
        title: 'Siparişi Reddet',
        message: 'Bu sipariş reddedilecek. Bu işlem geri alınamaz.',
        label: 'Reddet',
        variant: 'destructive',
      },
      completed: {
        status: OrderStatus.Completed,
        title: 'Siparişi Tamamla',
        message: 'Bu sipariş tamamlanacak ve stoktan düşüm yapılacak. Stok yetersizse işlem başarısız olacaktır.',
        label: 'Tamamla',
        variant: 'primary',
      },
    };

    const config = configs[action];
    this.pendingAction = config.status;
    this.confirmTitle.set(config.title);
    this.confirmMessage.set(config.message);
    this.confirmLabel.set(config.label);
    this.confirmVariant.set(config.variant);
    this.confirmOpen.set(true);
  }

  onConfirmAction(): void {
    const order = this.order();
    if (!order || !this.pendingAction) return;

    this.orderService.updateStatus(order.id, this.pendingAction).subscribe({
      next: (res) => {
        this.confirmOpen.set(false);
        if (res.success && res.data) {
          this.order.set(res.data);
          const label = OrderStatusLabel[this.pendingAction!];
          if (this.pendingAction === OrderStatus.Completed) {
            this.toastService.success('Sipariş tamamlandı, stok güncellendi');
          } else {
            this.toastService.success(`Sipariş durumu: ${label}`);
          }
        } else {
          this.toastService.error(res.message ?? 'Durum güncellenemedi');
        }
        this.pendingAction = null;
      },
      error: (err) => {
        this.confirmOpen.set(false);
        this.pendingAction = null;
        const message = err.error?.message ?? 'Durum güncellenemedi';
        this.toastService.error(message);
      },
    });
  }

  navigateToEdit(): void {
    const order = this.order();
    if (order) {
      this.router.navigate(['/sales-orders', order.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/sales-orders']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  }
}
