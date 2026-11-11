export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  warehouseId: string;
  warehouseName: string;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  warehouseId: string;
}

export interface UpdateProductRequest {
  name: string;
  sku: string;
  unitPrice: number;
  warehouseId: string;
}
