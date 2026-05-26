import { deliveryApi, DeliveryProvider, DeliveryEstimatedFee, Delivery, DeliveryTracking } from '../api/delivery';

interface DeliveryRequest {
  orderId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
}

type ProviderPriority = DeliveryProvider[];

const DEFAULT_PRIORITY: ProviderPriority = [
  'shop_vehicle',
  'uber',
  'careen',
  'jeeny',
  'smsa',
  'aramex',
];

class DeliveryManager {
  private priority: ProviderPriority;

  constructor(priority?: ProviderPriority) {
    this.priority = priority || DEFAULT_PRIORITY;
  }

  async findBestProvider(request: DeliveryRequest): Promise<{
    provider: DeliveryProvider;
    fee: number;
    estimatedMinutes: number;
  }> {
    const estimates = await deliveryApi.estimateFee(
      request.pickupLat,
      request.pickupLng,
      request.dropoffLat,
      request.dropoffLng,
    );

    const available = estimates.filter((e) => e.available);

    if (available.length === 0) {
      throw new Error('No delivery providers available');
    }

    const sortedByPriority = this.priority
      .map((p) => available.find((a) => a.provider === p))
      .filter((a): a is DeliveryEstimatedFee => a !== undefined);

    if (sortedByPriority.length === 0) {
      const cheapest = available.reduce((min, curr) =>
        curr.fee < min.fee ? curr : min,
      );
      return {
        provider: cheapest.provider,
        fee: cheapest.fee,
        estimatedMinutes: cheapest.estimatedMinutes,
      };
    }

    const best = sortedByPriority[0];
    return {
      provider: best.provider,
      fee: best.fee,
      estimatedMinutes: best.estimatedMinutes,
    };
  }

  async createDelivery(
    request: DeliveryRequest,
    preferredProvider?: DeliveryProvider,
  ): Promise<Delivery> {
    let provider = preferredProvider;

    if (!provider) {
      const best = await this.findBestProvider(request);
      provider = best.provider;
    }

    return deliveryApi.create({
      orderId: request.orderId,
      pickupAddress: {
        lat: request.pickupLat,
        lng: request.pickupLng,
        address: request.pickupAddress,
      },
      dropoffAddress: {
        lat: request.dropoffLat,
        lng: request.dropoffLng,
        address: request.dropoffAddress,
      },
      preferredProvider: provider,
    });
  }

  async trackDelivery(deliveryId: string): Promise<DeliveryTracking> {
    return deliveryApi.track(deliveryId);
  }

  getProviderName(provider: DeliveryProvider): string {
    const names: Record<DeliveryProvider, string> = {
      shop_vehicle: 'سيارة المحل',
      uber: 'أوبر',
      careen: 'كارين',
      jeeny: 'جيني',
      smsa: 'SMSA',
      aramex: 'أرامكس',
    };
    return names[provider] || provider;
  }

  getProviderNameEn(provider: DeliveryProvider): string {
    const names: Record<DeliveryProvider, string> = {
      shop_vehicle: 'Shop Vehicle',
      uber: 'Uber',
      careen: 'Careen',
      jeeny: 'Jeeny',
      smsa: 'SMSA',
      aramex: 'Aramex',
    };
    return names[provider] || provider;
  }
}

export const deliveryManager = new DeliveryManager();
export default deliveryManager;
