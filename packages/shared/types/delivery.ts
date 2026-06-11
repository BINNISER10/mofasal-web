export enum DeliveryProvider {
  SHOP_VEHICLE = 'SHOP_VEHICLE',
  UBER = 'UBER',
  CAREEN = 'CAREEN',
  JEENY = 'JEENY',
  TAXI = 'TAXI',
  SMSA = 'SMSA',
  ARAMEX = 'ARAMEX',
  OTHER = 'OTHER',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DISPATCHING = 'DISPATCHING',
  PROVIDER_SEARCHING = 'PROVIDER_SEARCHING',
  PROVIDER_ASSIGNED = 'PROVIDER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface DeliveryRequest {
  id: string;
  orderId: string;
  provider: DeliveryProvider;
  status: DeliveryStatus;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  trackingUrl?: string;
  estimatedArrival?: number;
  actualArrival?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  distance: number;
  cost: number;
  waybillNumber?: string;
  providerReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTrackingPoint {
  lat: number;
  lng: number;
  timestamp: string;
  status: DeliveryStatus;
}

export interface DeliveryProviderConfig {
  provider: DeliveryProvider;
  isEnabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  fallbackOrder: DeliveryProvider[];
}
