import { LeaveRequestStatus } from '../enums';

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveRequestStatus;
  statusName: string;
  approvedByEmployeeId: string | null;
  approvedByEmployeeName: string | null;
  createdDate: string;
}

export interface CreateLeaveRequestRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}
