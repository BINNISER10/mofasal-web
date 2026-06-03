import { ServiceRequestService } from '../src/services/ServiceRequestService';
import prisma from '../src/config/database';
import { NotificationService } from '../src/services/NotificationService';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    serviceRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    shop: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../src/services/NotificationService', () => ({
  __esModule: true,
  NotificationService: {
    notifyMeasurementDispatched: jest.fn(),
    notifyMeasurementArrived: jest.fn(),
    sendSMS: jest.fn(),
  },
}));

describe('ServiceRequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NotificationService.notifyMeasurementDispatched as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (NotificationService.notifyMeasurementArrived as jest.Mock).mockImplementation(() => Promise.resolve({}));
    (NotificationService.sendSMS as jest.Mock).mockImplementation(() => Promise.resolve(true));
  });

  describe('haversineKm', () => {
    it('should calculate distance correctly between two points', () => {
      // الرياض (شمال/شرق)
      const lat1 = 24.7136;
      const lng1 = 46.6753;
      // نقطة أخرى قريبة
      const lat2 = 24.7236;
      const lng2 = 46.6853;
      const dist = ServiceRequestService.haversineKm(lat1, lng1, lat2, lng2);
      expect(dist).toBeGreaterThan(1);
      expect(dist).toBeLessThan(2);
    });
  });

  describe('etaMinutes', () => {
    it('should estimate time correctly with minimum 5 minutes', () => {
      const etaSmall = ServiceRequestService.etaMinutes(0.5);
      expect(etaSmall).toBe(5);

      const etaLarge = ServiceRequestService.etaMinutes(30); // 30 km at 30 km/h = 1 hour (60 min)
      expect(etaLarge).toBe(60);
    });
  });

  describe('create', () => {
    it('should create a service request record', async () => {
      const mockReq = {
        id: 'req-1',
        customerId: 'cust-1',
        shopId: 'shop-1',
        serviceType: 'ON_SITE_MEASUREMENT',
        status: 'PENDING',
      };
      (prisma.serviceRequest.create as jest.Mock).mockResolvedValue(mockReq);

      const res = await ServiceRequestService.create({
        customerId: 'cust-1',
        shopId: 'shop-1',
        serviceType: 'ON_SITE_MEASUREMENT',
      });

      expect(res).toEqual(mockReq);
      expect(prisma.serviceRequest.create).toHaveBeenCalled();
    });
  });

  describe('dispatchNearest', () => {
    it('should throw an error if service request is not found', async () => {
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ServiceRequestService.dispatchNearest('req-unknown')).rejects.toThrow(
        'Service request not found'
      );
    });

    it('should throw an error if already has representative assigned', async () => {
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue({
        id: 'req-1',
        representativeId: 'rep-1',
      });

      await expect(ServiceRequestService.dispatchNearest('req-1')).rejects.toThrow(
        'تم تعيين مندوب لهذا الطلب مسبقاً'
      );
    });

    it('should throw an error if no representative is available', async () => {
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue({
        id: 'req-1',
        representativeId: null,
        shopId: 'shop-1',
      });
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(ServiceRequestService.dispatchNearest('req-1')).rejects.toThrow(
        'لا يوجد مندوبون متاحون حالياً'
      );
    });

    it('should assign a representative, calculate ETA, and trigger notification', async () => {
      const mockReq = {
        id: 'req-1',
        representativeId: null,
        shopId: 'shop-1',
        customerId: 'cust-1',
        lat: 24.7136,
        lng: 46.6753,
        status: 'PENDING',
      };
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);

      const mockRep = { id: 'rep-1', name: 'Mousa', phone: '0555555555' };
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockRep]);

      const mockShop = { id: 'shop-1', lat: 24.7036, lng: 46.6653 };
      (prisma.shop.findUnique as jest.Mock).mockResolvedValue(mockShop);

      (prisma.serviceRequest.update as jest.Mock).mockResolvedValue({
        ...mockReq,
        representativeId: 'rep-1',
        status: 'ASSIGNED',
        distanceKm: 1.5,
        estimatedArrivalMin: 5,
      });

      const result = await ServiceRequestService.dispatchNearest('req-1');

      expect(result.representative.id).toBe('rep-1');
      expect(prisma.serviceRequest.update).toHaveBeenCalled();
      expect(NotificationService.notifyMeasurementDispatched).toHaveBeenCalled();
    });
  });

  describe('updateRepLocation', () => {
    it('should update coordinates and recalculate remaining distance/ETA', async () => {
      const mockReq = {
        id: 'req-1',
        customerId: 'cust-1',
        shopId: 'shop-1',
        lat: 24.7136,
        lng: 46.6753,
        status: 'ASSIGNED',
      };
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);
      (prisma.serviceRequest.update as jest.Mock).mockResolvedValue({
        ...mockReq,
        repLat: 24.7100,
        repLng: 46.6700,
        status: 'EN_ROUTE',
      });

      const updated = await ServiceRequestService.updateRepLocation('req-1', 24.7100, 46.6700);

      expect(updated.status).toBe('EN_ROUTE');
      expect(prisma.serviceRequest.update).toHaveBeenCalled();
    });
  });

  describe('markArrived', () => {
    it('should mark status as ARRIVED and trigger arrival notifications', async () => {
      const mockReq = {
        id: 'req-1',
        customerId: 'cust-1',
        shopId: 'shop-1',
        representativeId: 'rep-1',
        status: 'EN_ROUTE',
      };
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);
      (prisma.serviceRequest.update as jest.Mock).mockResolvedValue({
        ...mockReq,
        status: 'ARRIVED',
        arrivedAt: new Date(),
      });

      const result = await ServiceRequestService.markArrived('req-1');

      expect(result.status).toBe('ARRIVED');
      expect(NotificationService.notifyMeasurementArrived).toHaveBeenCalled();
    });
  });

  describe('getTracking', () => {
    it('should return tracking payload with shop and representative details', async () => {
      const mockReq = {
        id: 'req-1',
        customerId: 'cust-1',
        shopId: 'shop-1',
        representativeId: 'rep-1',
        status: 'ASSIGNED',
        lat: 24.7,
        lng: 46.7,
        repLat: 24.6,
        repLng: 46.6,
        distanceKm: 10,
        estimatedArrivalMin: 20,
        assignedAt: new Date(),
        arrivedAt: null,
        shop: { id: 'shop-1', name: 'Fine Tailor', nameAr: 'خياط فاخر' },
      };
      (prisma.serviceRequest.findUnique as jest.Mock).mockResolvedValue(mockReq);

      const mockRep = { id: 'rep-1', name: 'Mousa', phone: '0555555555', avatar: null };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockRep);

      const tracking = await ServiceRequestService.getTracking('req-1');

      expect(tracking.id).toBe('req-1');
      expect(tracking.representative?.name).toBe('Mousa');
      expect(tracking.shop?.name).toBe('Fine Tailor');
    });
  });
});
