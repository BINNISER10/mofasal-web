import { OrderStatus } from '../types/order';

export interface OrderStatusConfig {
  key: OrderStatus;
  label: string;
  labelAr: string;
  color: string;
  backgroundColor: string;
  icon: string;
  animationName: string;
}

export const ORDER_STATUS_CONFIG: OrderStatusConfig[] = [
  {
    key: OrderStatus.ORDER_RECEIVED,
    label: 'Order Received',
    labelAr: 'تم استلام الطلب',
    color: '#FFFFFF',
    backgroundColor: '#1976D2',
    icon: 'inbox',
    animationName: 'slideInRight',
  },
  {
    key: OrderStatus.STAFF_ON_WAY,
    label: 'Staff On Way',
    labelAr: 'الموظف في الطريق',
    color: '#FFFFFF',
    backgroundColor: '#FFA000',
    icon: 'directions_walk',
    animationName: 'bounceIn',
  },
  {
    key: OrderStatus.TAKING_MEASUREMENTS,
    label: 'Taking Measurements',
    labelAr: 'أخذ المقاسات',
    color: '#FFFFFF',
    backgroundColor: '#FFA000',
    icon: 'straighten',
    animationName: 'fadeIn',
  },
  {
    key: OrderStatus.CUTTING_FABRIC,
    label: 'Cutting Fabric',
    labelAr: 'قص القماش',
    color: '#FFFFFF',
    backgroundColor: '#4CAF50',
    icon: 'content_cut',
    animationName: 'zoomIn',
  },
  {
    key: OrderStatus.SEWING_ASSEMBLY,
    label: 'Sewing & Assembly',
    labelAr: 'الخياطة والتجميع',
    color: '#FFFFFF',
    backgroundColor: '#1B5E20',
    icon: 'sewing',
    animationName: 'pulse',
  },
  {
    key: OrderStatus.IRONING_FINISHING,
    label: 'Ironing & Finishing',
    labelAr: 'الكي والتشطيب',
    color: '#FFFFFF',
    backgroundColor: '#D4AF37',
    icon: 'iron',
    animationName: 'slideInLeft',
  },
  {
    key: OrderStatus.PACKING_WRAPPING,
    label: 'Packing & Wrapping',
    labelAr: 'التغليف والتعبئة',
    color: '#FFFFFF',
    backgroundColor: '#D4AF37',
    icon: 'inventory_2',
    animationName: 'bounceIn',
  },
  {
    key: OrderStatus.ON_WAY_TO_CUSTOMER,
    label: 'On Way to Customer',
    labelAr: 'في الطريق إلى العميل',
    color: '#FFFFFF',
    backgroundColor: '#FFA000',
    icon: 'local_shipping',
    animationName: 'slideInRight',
  },
  {
    key: OrderStatus.DELIVERED,
    label: 'Delivered',
    labelAr: 'تم التوصيل',
    color: '#FFFFFF',
    backgroundColor: '#388E3C',
    icon: 'check_circle',
    animationName: 'tada',
  },
  {
    key: OrderStatus.CANCELLED,
    label: 'Cancelled',
    labelAr: 'ملغي',
    color: '#FFFFFF',
    backgroundColor: '#D32F2F',
    icon: 'cancel',
    animationName: 'shake',
  },
  {
    key: OrderStatus.REFUNDED,
    label: 'Refunded',
    labelAr: 'تم الاسترداد',
    color: '#FFFFFF',
    backgroundColor: '#757575',
    icon: 'monetization_on',
    animationName: 'fadeOut',
  },
];

export const ORDER_STATUS_PROGRESSION: OrderStatus[] = [
  OrderStatus.ORDER_RECEIVED,
  OrderStatus.STAFF_ON_WAY,
  OrderStatus.TAKING_MEASUREMENTS,
  OrderStatus.CUTTING_FABRIC,
  OrderStatus.SEWING_ASSEMBLY,
  OrderStatus.IRONING_FINISHING,
  OrderStatus.PACKING_WRAPPING,
  OrderStatus.ON_WAY_TO_CUSTOMER,
  OrderStatus.DELIVERED,
];

export const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];
