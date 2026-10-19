import { OrderStatus } from '../enums';

export interface PurchaseOrderLineDto {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderDto {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  status: OrderStatus;
  statusName: string;
  approvedByEmployeeId: string | null;
  approvedByEmployeeName: string | null;
  totalAmount: number;
  createdDate: string;
  createdBy: string | null;
  lines: PurchaseOrderLineDto[];
}

export interface CreatePurchaseOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  orderDate: string;
  lines: CreatePurchaseOrderLineRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplierId: string;
  orderDate: string;
  lines: CreatePurchaseOrderLineRequest[];
}
