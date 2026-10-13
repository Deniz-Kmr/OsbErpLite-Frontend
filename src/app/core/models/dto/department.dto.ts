export interface DepartmentDto {
  id: string;
  name: string;
  managerId: string | null;
  managerName: string | null;
  createdDate: string;
}

export interface CreateDepartmentRequest {
  name: string;
  managerId?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  managerId?: string;
}
