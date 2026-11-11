import { StockMovementType } from '../enums';

export interface StockMovementDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  movementType: StockMovementType;
  movementTypeName: string;
  date: string;
  note: string | null;
  createdDate: string;
}

export interface CreateStockMovementRequest {
  productId: string;
  quantity: number;
  movementType: StockMovementType;
  note?: string;
}
