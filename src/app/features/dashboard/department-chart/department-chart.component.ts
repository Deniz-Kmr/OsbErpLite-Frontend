import {
  Component,
  ChangeDetectionStrategy,
  input,
  OnInit,
  DestroyRef,
  inject,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { DepartmentDistributionDto } from '@core/models/dto/dashboard.dto';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const PALETTE_LIGHT = [
  '#6366F1', '#818CF8', '#A5B4FC', '#4F46E5', '#4338CA',
  '#3730A3', '#312E81', '#C7D2FE', '#E0E7FF',
];

const PALETTE_DARK = [
  '#818CF8', '#A5B4FC', '#C7D2FE', '#6366F1', '#4F46E5',
  '#4338CA', '#3730A3', '#E0E7FF', '#312E81',
];

@Component({
  selector: 'app-department-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card">
      <h3 class="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Departman Dağılımı
      </h3>
      <div class="relative mx-auto" style="max-width: 320px; aspect-ratio: 1">
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
export class DepartmentChartComponent implements OnInit {
  readonly data = input.required<DepartmentDistributionDto[]>();

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
    const isDark = document.documentElement.classList.contains('dark');
    const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;

    this.chart = new Chart(this.canvasRef().nativeElement, {
      type: 'doughnut',
      data: {
        labels: d.map((dep) => dep.departmentName),
        datasets: [
          {
            data: d.map((dep) => dep.employeeCount),
            backgroundColor: palette.slice(0, d.length),
            borderWidth: 2,
            borderColor: isDark ? '#1E293B' : '#FFFFFF',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
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
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} kişi`,
            },
          },
        },
      },
    });
  }

  private updateChart(d: DepartmentDistributionDto[]): void {
    if (!this.chart) return;
    const isDark = document.documentElement.classList.contains('dark');
    const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;
    this.chart.data.labels = d.map((dep) => dep.departmentName);
    this.chart.data.datasets[0].data = d.map((dep) => dep.employeeCount);
    this.chart.data.datasets[0].backgroundColor = palette.slice(0, d.length);
    this.chart.update();
  }
}
