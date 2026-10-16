import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { UserRole } from '@core/models/enums';
import { DashboardSummaryDto, MonthlyStockMovementDto, DepartmentDistributionDto } from '@core/models/dto/dashboard.dto';
import { DashboardService } from './dashboard.service';
import { KpiCardComponent } from './kpi-card/kpi-card.component';
import { StockMovementChartComponent } from './stock-movement-chart/stock-movement-chart.component';
import { DepartmentChartComponent } from './department-chart/department-chart.component';

interface KpiItem {
  title: string;
  value: number;
  icon: string;
  format: 'number' | 'currency';
  trend: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KpiCardComponent, StockMovementChartComponent, DepartmentChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styles: `
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (min-width: 1280px) {
      .kpi-grid { grid-template-columns: repeat(4, 1fr); }
    }

    .chart-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 1024px) {
      .chart-grid { grid-template-columns: 3fr 2fr; }
    }

    .skeleton-pulse {
      animation: pulse 1.5s ease-in-out infinite;
      background: var(--bg-muted);
      border-radius: 1rem;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-pulse { animation: none; opacity: 0.7; }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly kpiItems = signal<KpiItem[]>([]);
  readonly stockMovements = signal<MonthlyStockMovementDto[]>([]);
  readonly departmentDistribution = signal<DepartmentDistributionDto[]>([]);

  readonly showCharts = this.authService.hasRole([UserRole.Admin, UserRole.Manager]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary(),
      stockMovements: this.dashboardService.getStockMovements(),
      departments: this.dashboardService.getDepartmentDistribution(),
    }).subscribe({
      next: ({ summary, stockMovements, departments }) => {
        if (summary.success && summary.data) {
          this.buildKpiItems(summary.data);
        }
        if (stockMovements.success && stockMovements.data) {
          this.stockMovements.set(stockMovements.data);
        }
        if (departments.success && departments.data) {
          this.departmentDistribution.set(departments.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Veriler yüklenirken bir hata oluştu.');
        this.loading.set(false);
      },
    });
  }

  private buildKpiItems(s: DashboardSummaryDto): void {
    const items: KpiItem[] = [
      { title: 'Aktif Çalışan', value: s.totalActiveEmployeeCount, icon: 'users', format: 'number', trend: null },
      { title: 'Müşteri', value: s.activeCustomerCount, icon: 'user-circle', format: 'number', trend: null },
      { title: 'Tedarikçi', value: s.activeSupplierCount, icon: 'truck', format: 'number', trend: null },
      { title: 'Her İkisi', value: s.activeBothCount, icon: 'users-three', format: 'number', trend: null },
      { title: 'Bekleyen Satın Alma', value: s.pendingPurchaseOrdersCount, icon: 'shopping-cart', format: 'number', trend: null },
      { title: 'Bekleyen Satış', value: s.pendingSalesOrdersCount, icon: 'storefront', format: 'number', trend: null },
      { title: 'Bekleyen İzin', value: s.pendingLeaveRequestsCount, icon: 'calendar', format: 'number', trend: null },
      { title: 'Düşük Stok', value: s.lowStockProductsCount, icon: 'warning', format: 'number', trend: null },
    ];

    if (s.totalStockValue !== null) {
      items.push({
        title: 'Toplam Stok Değeri',
        value: s.totalStockValue,
        icon: 'currency-dollar',
        format: 'currency',
        trend: null,
      });
    }

    this.kpiItems.set(items);
  }
}
