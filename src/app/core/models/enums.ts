export enum UserRole {
  Admin = 1,
  Manager = 2,
  Employee = 3,
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Manager]: 'Yonetici',
  [UserRole.Employee]: 'Calisan',
};

export enum OrderStatus {
  Draft = 1,
  Pending = 2,
  Approved = 3,
  Rejected = 4,
  Completed = 5,
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Draft]: 'Taslak',
  [OrderStatus.Pending]: 'Beklemede',
  [OrderStatus.Approved]: 'Onaylandi',
  [OrderStatus.Rejected]: 'Reddedildi',
  [OrderStatus.Completed]: 'Tamamlandi',
};

export enum BusinessPartnerType {
  Customer = 1,
  Supplier = 2,
  Both = 3,
}

export const BusinessPartnerTypeLabel: Record<BusinessPartnerType, string> = {
  [BusinessPartnerType.Customer]: 'Musteri',
  [BusinessPartnerType.Supplier]: 'Tedarikci',
  [BusinessPartnerType.Both]: 'Musteri & Tedarikci',
};

export enum EmployeeStatus {
  Active = 1,
  OnLeave = 2,
  Terminated = 3,
}

export const EmployeeStatusLabel: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: 'Aktif',
  [EmployeeStatus.OnLeave]: 'Izinli',
  [EmployeeStatus.Terminated]: 'Ayrildi',
};

export enum LeaveRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export const LeaveRequestStatusLabel: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.Pending]: 'Beklemede',
  [LeaveRequestStatus.Approved]: 'Onaylandi',
  [LeaveRequestStatus.Rejected]: 'Reddedildi',
};

export enum StockMovementType {
  In = 1,
  Out = 2,
}

export const StockMovementTypeLabel: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'Giris',
  [StockMovementType.Out]: 'Cikis',
};
