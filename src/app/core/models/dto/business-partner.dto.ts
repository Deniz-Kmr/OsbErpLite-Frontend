import { BusinessPartnerType } from '../enums';

export interface BusinessPartnerDto {
  id: string;
  name: string;
  taxNumber: string | null;
  type: BusinessPartnerType;
  typeName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateBusinessPartnerRequest {
  name: string;
  taxNumber?: string;
  type: BusinessPartnerType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface UpdateBusinessPartnerRequest {
  name: string;
  taxNumber?: string;
  type: BusinessPartnerType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}
