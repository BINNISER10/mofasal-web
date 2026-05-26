import { UserRole, UserStatus, Permission } from './auth';

export interface User {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  coverImage?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AddressLabel {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

export interface Address {
  id: string;
  userId: string;
  label: AddressLabel;
  street: string;
  district: string;
  city: string;
  region: string;
  country: string;
  buildingNumber: string;
  apartmentNumber?: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: string;
}

export enum MeasurementGender {
  MEN = 'MEN',
  BOYS = 'BOYS',
  GIRLS = 'GIRLS',
}

export interface MeasurementData {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  sleeveLength?: number;
  shirtLength?: number;
  trouserLength?: number;
  trouserWaist?: number;
  inseam?: number;
  outseam?: number;
  bicep?: number;
  wrist?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  [key: string]: number | undefined;
}

export interface UserMeasurement {
  id: string;
  userId: string;
  name: string;
  gender: MeasurementGender;
  data: MeasurementData;
  notes?: string;
  createdAt: string;
}

export interface TailorShopProfile {
  shopId: string;
  ownerId: string;
  ownerName: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  email?: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  rating: number;
  totalOrders: number;
  totalReviews: number;
  status: string;
  isOpen: boolean;
  deliveryRadius: number;
  estimatedArrivalMinutes: number;
  commissionRate: number;
  featuredImage?: string;
  isVerified: boolean;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfile {
  id: string;
  userId: string;
  storeName: string;
  storeNameAr: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  email?: string;
  commercialRegister: string;
  taxNumber: string;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  isVerified: boolean;
  createdAt: string;
}

export enum StaffRole {
  TAILOR = 'TAILOR',
  RECEPTIONIST = 'RECEPTIONIST',
  DELIVERY = 'DELIVERY',
  MANAGER = 'MANAGER',
  CUTTER = 'CUTTER',
  FINISHER = 'FINISHER',
}

export interface StaffMember {
  id: string;
  shopId: string;
  userId: string;
  name: string;
  role: StaffRole;
  permissions: Permission[];
  salary: number;
  commissionRate: number;
  shiftStart?: string;
  shiftEnd?: string;
  workDays: number[];
  isActive: boolean;
  performanceScore: number;
  totalOrdersCompleted: number;
  joinedAt: string;
}
