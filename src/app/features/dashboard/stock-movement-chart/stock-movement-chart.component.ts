import {
  Component,
  ChangeDetectionStrategy,
  input,
  OnInit,
  OnChanges,
  DestroyRef,
  inject,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { MonthlyStockMovementDto } from '@core/models/dto/dashboard.dto';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTH_NAMES = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

@Component({
  selector: 'app-stock-movement-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card">
      <h3 class="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Aylık Stok Hareketi
      </h3>
      <div class="relative aspect-[16/9]">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .chart-card {
      padding: 1.5rem;
      border-radius: 1rem;
      background: var(--bg-surface);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
    }
  `,
})
export class StockMovementChartComponent implements OnInit {
  readonly data = input.required<MonthlyStockMovementDto[]>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const d = this.data();
      if (this.chart && d.length) {
        this.updateChart(d);
      }
    });
  }

  ngOnInit(): void {
    this.createChart();
    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  private createChart(): void {
    const d = this.data();
    const labels = d.map((m) => `${MONTH_NAMES[m.month - 1]} ${m.year}`);
    const isDark = document.documentElement.classList.contains('dark');

    this.chart = new Chart(this.canvasRef().nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Giriş',
            data: d.map((m) => m.totalIn),
            backgroundColor: isDark ? '#34D399' : '#10B981',
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
          {
            label: 'Çıkış',
            data: d.map((m) => m.totalOut),
            backgroundColor: isDark ? '#F87171' : '#EF4444',
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              color: isDark ? '#94A3B8' : '#475569',
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 500 },
            },
          },
          tooltip: {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            titleColor: isDark ? '#F1F5F9' : '#0F172A',
            bodyColor: isDark ? '#94A3B8' : '#475569',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
            bodyFont: { family: 'JetBrains Mono', size: 12 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#64748B' : '#94A3B8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
            ticks: {
              color: isDark ? '#64748B' : '#94A3B8',
              font: { family: 'JetBrains Mono', size: 11 },
            },
          },
        },
      },
    });
  }

  private updateChart(d: MonthlyStockMovementDto[]): void {
    if (!this.chart) return;
    const labels = d.map((m) => `${MONTH_NAMES[m.month - 1]} ${m.year}`);
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = d.map((m) => m.totalIn);
    this.chart.data.datasets[1].data = d.map((m) => m.totalOut);
    this.chart.update();
  }
}
