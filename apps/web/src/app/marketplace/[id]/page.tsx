'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi } from '@/lib/api/products';
import { mapProductDetail, type ProductDetailView } from '@/lib/mappers/productDetail';
import {
  Star, Heart, Share2, ShoppingCart, ChevronLeft, ChevronRight,
  Package, Truck, Shield, RotateCcw, Check, Plus, Minus,
  Ruler, Layers, ArrowLeft, ArrowRight, Store, MapPin
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [quantity, setQuantity] = useState(3);
  const [selectedColor, setSelectedColor] = useState(0);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const productId = String(params.id);
  const [product, setProduct] = useState<ProductDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    productsApi.getById(productId)
      .then((res) => {
        if (!active) return;
        if (!res.product?.id) {
          setError(true);
          return;
        }
        setProduct(mapProductDetail(res.product));
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  const ChevronBack = isRTL ? ChevronRight : ChevronLeft;
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        <Navbar />
        <div className="text-center py-32 text-neutral-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-neutral-500 mb-4">{isRTL ? 'المنتج غير متوفر' : 'Product not found'}</p>
          <Button onClick={() => router.push('/marketplace')}>{isRTL ? 'العودة للسوق' : 'Back to marketplace'}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <a href="/" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">{isRTL ? 'الرئيسية' : 'Home'}</a>
          <ChevronBack size={14} />
          <a href="/marketplace" className="hover:text-[#0A0A0A] dark:hover:text-white transition-colors">{isRTL ? 'الأقمشة' : 'Fabrics'}</a>
          <ChevronBack size={14} />
          <span className="text-[#0A0A0A] dark:text-white font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 mb-12">
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-[#E8E8E8] dark:border-white/10">
              <div
                className="aspect-[3/4] flex items-center justify-center bg-neutral-50 dark:bg-white/5"
                style={{ background: `linear-gradient(160deg, ${product.colors[selectedColor]}18, ${product.colors[selectedColor]}55)` }}
              >
                <div className="text-center">
                  <div
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl mx-auto shadow-lg"
                    style={{ background: product.colors[selectedColor] }}
                  />
                  <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">{product.colorNames[selectedColor]}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(i)}
                  className={`flex-1 h-14 rounded-xl border-2 transition-all ${selectedColor === i ? 'border-[#00373E] dark:border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  style={{ background: `linear-gradient(135deg, ${img.color}33, ${img.color}77)` }}
                  title={img.label}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="info" size="sm" className="mb-2">{product.category}</Badge>
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-white leading-tight tracking-tight">{product.name}</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2.5 rounded-xl border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400'}`}
                  >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 hover:text-primary-600 transition-all">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Merchant */}
              <a href={`/shops/${product.merchantId}`} className="inline-flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
                <Store size={14} />
                {product.merchant}
                <MapPin size={12} className="text-gray-400" />
                <span className="text-gray-400">{product.merchantCity}</span>
              </a>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= Math.round(product.rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="font-bold text-gray-800">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviewCount} {isRTL ? 'تقييم' : 'reviews'})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[#0A0A0A] dark:text-white">﷼{product.price}</span>
              <span className="text-sm text-neutral-400">{isRTL ? product.priceUnit : product.priceUnitEn}</span>
            </div>

            {/* Color Selector */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {isRTL ? 'اللون:' : 'Color:'} <span className="text-primary-600">{product.colorNames[selectedColor]}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    title={product.colorNames[i]}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'border-primary-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {isRTL ? 'الكمية (بالمتر):' : 'Quantity (meters):'}
                <span className="text-xs text-gray-400 mr-2">({isRTL ? 'الحد الأدنى' : 'Min'}: {product.minOrder}م)</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-bold text-gray-800 min-w-[60px] text-center">{quantity}م</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.maxOrder, quantity + 1))}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'الإجمالي:' : 'Total:'} <span className="font-bold text-primary-700">{(product.price * quantity).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={<ShoppingCart size={18} />}
                onClick={() => router.push(`/dashboard/customer/orders/new?fabric=${product.id}&qty=${quantity}&color=${selectedColor}`)}
              >
                {isRTL ? 'اطلب التفصيل مع هذا القماش' : 'Order Tailoring with This Fabric'}
              </Button>
              <Button variant="outline" fullWidth size="lg" onClick={() => router.push('/marketplace')}>
                {isRTL ? 'عرض المزيد من الأقمشة' : 'Browse More Fabrics'}
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: <Truck size={16} />, label: isRTL ? (product.shipping.free ? 'شحن مجاني' : `شحن ${product.shipping.days} أيام`) : (product.shipping.free ? 'Free Shipping' : `${product.shipping.days} days`) },
                { icon: <Shield size={16} />, label: isRTL ? 'جودة مضمونة' : 'Quality Guaranteed' },
                { icon: <RotateCcw size={16} />, label: isRTL ? `إرجاع ${product.returnPolicy}` : `${product.returnPolicy} returns` },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">{item.icon}</div>
                  <p className="text-xs text-gray-500 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="mb-8">
          <div className="flex gap-1 p-2 border-b border-gray-100">
            {(['desc', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'desc' ? (isRTL ? 'الوصف' : 'Description')
                  : tab === 'specs' ? (isRTL ? 'المواصفات' : 'Specs')
                  : (isRTL ? `التقييمات (${product.reviewCount})` : `Reviews (${product.reviewCount})`)}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">{isRTL ? 'الاستخدامات المقترحة:' : 'Suggested Uses:'}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.uses.map((use: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <Check size={12} />{use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {product.features.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      {i % 3 === 0 ? <Layers size={15} /> : i % 3 === 1 ? <Ruler size={15} /> : <Package size={15} />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{f.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.name} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-800">{review.name}</p>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <div className="flex mt-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={12} className={i <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Related Products */}
        {product.relatedProducts?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{isRTL ? 'منتجات مشابهة' : 'Related Products'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.relatedProducts.map((rel: any) => (
                <a key={rel.id} href={`/marketplace/${rel.id}`}>
                  <Card className="p-4 hover:-translate-y-1 transition-all" hover>
                    <div className="h-20 rounded-xl mb-3" style={{ background: `linear-gradient(135deg, ${rel.color}33, ${rel.color}88)` }} />
                    <p className="font-semibold text-sm text-gray-900 leading-tight">{rel.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-700 text-sm">{rel.price} {isRTL ? 'ر.س/م' : 'SAR/m'}</span>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-gold-500 fill-gold-500" />
                        <span className="text-xs text-gray-600">{rel.rating}</span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
