import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import {
  OrderStatus,
  EmployeeStatus,
  LeaveRequestStatus,
  BusinessPartnerType,
  StockMovementType,
  OrderStatusLabel,
  EmployeeStatusLabel,
  LeaveRequestStatusLabel,
  BusinessPartnerTypeLabel,
  StockMovementTypeLabel,
} from '@core/models/enums';

type BadgeEnum =
  | OrderStatus
  | EmployeeStatus
  | LeaveRequestStatus
  | BusinessPartnerType
  | StockMovementType;

interface BadgeStyle {
  bg: string;
  text: string;
  darkBg: string;
  darkText: string;
}

const STATUS_STYLES: Record<string, BadgeStyle> = {
  [`order-${OrderStatus.Draft}`]: { bg: '#F1F5F9', text: '#475569', darkBg: '#334155', darkText: '#94A3B8' },
  [`order-${OrderStatus.Pending}`]: { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FDE68A' },
  [`order-${OrderStatus.Approved}`]: { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1E3A5F', darkText: '#93C5FD' },
  [`order-${OrderStatus.Rejected}`]: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#7F1D1D', darkText: '#FCA5A5' },
  [`order-${OrderStatus.Completed}`]: { bg: '#D1FAE5', text: '#065F46', darkBg: '#064E3B', darkText: '#6EE7B7' },

  [`employee-${EmployeeStatus.Active}`]: { bg: '#D1FAE5', text: '#065F46', darkBg: '#064E3B', darkText: '#6EE7B7' },
  [`employee-${EmployeeStatus.OnLeave}`]: { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FDE68A' },
  [`employee-${EmployeeStatus.Terminated}`]: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#7F1D1D', darkText: '#FCA5A5' },

  [`leave-${LeaveRequestStatus.Pending}`]: { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FDE68A' },
  [`leave-${LeaveRequestStatus.Approved}`]: { bg: '#D1FAE5', text: '#065F46', darkBg: '#064E3B', darkText: '#6EE7B7' },
  [`leave-${LeaveRequestStatus.Rejected}`]: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#7F1D1D', darkText: '#FCA5A5' },

  [`partner-${BusinessPartnerType.Customer}`]: { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1E3A5F', darkText: '#93C5FD' },
  [`partner-${BusinessPartnerType.Supplier}`]: { bg: '#E0E7FF', text: '#3730A3', darkBg: '#312E81', darkText: '#A5B4FC' },
  [`partner-${BusinessPartnerType.Both}`]: { bg: '#F3E8FF', text: '#6B21A8', darkBg: '#581C87', darkText: '#D8B4FE' },

  [`stock-${StockMovementType.In}`]: { bg: '#D1FAE5', text: '#065F46', darkBg: '#064E3B', darkText: '#6EE7B7' },
  [`stock-${StockMovementType.Out}`]: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#7F1D1D', darkText: '#FCA5A5' },
};

const LABEL_MAPS: Record<string, Record<number, string>> = {
  order: OrderStatusLabel,
  employee: EmployeeStatusLabel,
  leave: LeaveRequestStatusLabel,
  partner: BusinessPartnerTypeLabel,
  stock: StockMovementTypeLabel,
};

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap"
      [style.background-color]="colors().bg"
      [style.color]="colors().text"
    >
      {{ displayLabel() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    :host-context(.dark) span {
      background-color: var(--badge-dark-bg) !important;
      color: var(--badge-dark-text) !important;
    }
  `,
})
export class BadgeComponent {
  variant = input.required<string>();
  value = input.required<BadgeEnum>();
  label = input<string>('');

  colors = computed(() => {
    const key = `${this.variant()}-${this.value()}`;
    const style = STATUS_STYLES[key];
    if (style) {
      return { bg: style.bg, text: style.text, darkBg: style.darkBg, darkText: style.darkText };
    }
    return { bg: '#F1F5F9', text: '#475569', darkBg: '#334155', darkText: '#94A3B8' };
  });

  displayLabel = computed(() => {
    if (this.label()) return this.label();
    const map = LABEL_MAPS[this.variant()];
    return map?.[this.value() as number] ?? '';
  });
}
