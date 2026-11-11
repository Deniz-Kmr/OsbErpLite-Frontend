import { EmployeeStatus } from '../enums';

export interface EmployeeDto {
  id: string;
  fullName: string;
  nationalId: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  managerId: string | null;
  managerName: string | null;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
  statusName: string;
  createdDate: string;
}

export interface CreateEmployeeRequest {
  fullName: string;
  nationalId: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hireDate: string;
  salary: number;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  nationalId: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
}
