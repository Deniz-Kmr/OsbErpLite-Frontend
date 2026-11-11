export interface DashboardSummaryDto {
  totalActiveEmployeeCount: number;
  activeCustomerCount: number;
  activeSupplierCount: number;
  activeBothCount: number;
  pendingPurchaseOrdersCount: number;
  pendingSalesOrdersCount: number;
  pendingLeaveRequestsCount: number;
  lowStockProductsCount: number;
  totalStockValue: number | null;
}

export interface MonthlyStockMovementDto {
  year: number;
  month: number;
  totalIn: number;
  totalOut: number;
}

export interface DepartmentDistributionDto {
  departmentName: string;
  employeeCount: number;
}
