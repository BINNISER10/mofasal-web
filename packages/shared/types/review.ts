export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  shopId: string;
  shopRating: number;
  shopReview?: string;
  tailorId?: string;
  tailorRating?: number;
  tailorReview?: string;
  representativeId?: string;
  representativeRating?: number;
  representativeReview?: string;
  isPublished: boolean;
  isVerified: boolean;
  responseFromShop?: string;
  responseFromShopAt?: string;
  createdAt: string;
}
