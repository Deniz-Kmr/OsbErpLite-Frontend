export interface WarehouseDto {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateWarehouseRequest {
  name: string;
  location?: string;
}

export interface UpdateWarehouseRequest {
  name: string;
  location?: string;
}
