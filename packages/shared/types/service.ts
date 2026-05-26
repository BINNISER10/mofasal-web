export enum ServiceType {
  ON_SITE_MEASUREMENT = 'ON_SITE_MEASUREMENT',
  IN_SHOP_MEASUREMENT = 'IN_SHOP_MEASUREMENT',
  TAILORING = 'TAILORING',
  ALTERATION = 'ALTERATION',
  CONSULTATION = 'CONSULTATION',
  DESIGN = 'DESIGN',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  STAFF_ASSIGNED = 'STAFF_ASSIGNED',
  STAFF_ON_WAY = 'STAFF_ON_WAY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LocationType {
  HOME = 'HOME',
  WORK = 'WORK',
  REST_HOUSE = 'REST_HOUSE',
  OTHER = 'OTHER',
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  shopId: string;
  serviceType: ServiceType;
  status: RequestStatus;
  locationType?: LocationType;
  addressId?: string;
  customAddress?: string;
  customLat?: number;
  customLng?: number;
  scheduledDate?: string;
  preferredTimeSlot?: string;
  notes?: string;
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  shopId: string;
  name: string;
  nameAr: string;
  description?: string;
  price: number;
  durationMinutes: number;
  servicesIncluded: string[];
  isActive: boolean;
}
