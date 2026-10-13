import { OrderStatus } from '../enums';

export interface SalesOrderLineDto {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrderDto {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  statusName: string;
  approvedByEmployeeId: string | null;
  approvedByEmployeeName: string | null;
  totalAmount: number;
  createdDate: string;
  createdBy: string | null;
  lines: SalesOrderLineDto[];
}

export interface CreateSalesOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  orderDate: string;
  lines: CreateSalesOrderLineRequest[];
}
