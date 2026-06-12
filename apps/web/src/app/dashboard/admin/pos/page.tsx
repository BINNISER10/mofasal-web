'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { posApi, Product } from '@/lib/api/pos';
import { ShoppingCart, Plus, Minus, Search, Printer, CreditCard, DollarSign, X, Package, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  total: number;
}

export default function AdminPOSPage() {
  const { isRTL } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const categories = ['ALL', 'Thobes', 'Fabrics', 'Accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await posApi.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         (p.nameAr && p.nameAr.includes(search));
    const matchesCategory = selectedCategory === 'ALL' || (p.category?.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stockQuantity) {
        setCart(cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        ));
      } else {
        toast.error(isRTL ? 'الكمية غير متوفرة' : 'Insufficient stock');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.price }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, total: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      // Open a new session
      const session = await posApi.openSession(0);
      
      // Create order in the session
      await posApi.createOrder(session.id, {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod,
      });
      
      // Close the session
      await posApi.closeSession(session.id, cartTotal * 1.15);
      
      toast.success(isRTL ? 'تمت العملية بنجاح' : 'Payment successful');
      setCart([]);
      setShowPayment(false);
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(isRTL ? 'فشلت العملية' : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-10"
              placeholder={isRTL ? 'بحث عن منتج...' : 'Search products...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => addToCart(product)}
            >
              <div className="w-full h-32 bg-gray-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100 line-clamp-1">
                {isRTL ? product.nameAr : product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <p className="font-bold text-primary-600">{formatCurrency(product.price)}</p>
                <Badge variant={product.stockQuantity > 10 ? 'success' : 'danger'} size="sm">
                  {product.stockQuantity}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <ShoppingCart size={20} />
                {isRTL ? 'السلة' : 'Cart'}
              </h2>
              <Badge variant="primary">{cartCount}</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                <p>{isRTL ? 'السلة فارغة' : 'Cart is empty'}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-slate-100 flex-1">
                      {isRTL ? item.nameAr : item.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-primary-600">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المجموع' : 'Subtotal'}</span>
              <span className="font-medium">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'الضريبة (15%)' : 'VAT (15%)'}</span>
              <span className="font-medium">{formatCurrency(cartTotal * 0.15)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-primary-600">{formatCurrency(cartTotal * 1.15)}</span>
            </div>
            <Button
              variant="primary"
              fullWidth
              icon={<ShoppingCart size={18} />}
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              {isRTL ? 'إتمام البيع' : 'Checkout'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'CASH', icon: <DollarSign size={24} />, label: isRTL ? 'نقد' : 'Cash' },
                { id: 'MADA', icon: <CreditCard size={24} />, label: 'MADA' },
                { id: 'VISA', icon: <CreditCard size={24} />, label: 'Visa/Mastercard' },
                { id: 'STC', icon: <CreditCard size={24} />, label: 'STC Pay' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-primary-600">{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>{isRTL ? 'المبلغ' : 'Amount'}</span>
                <span className="text-primary-600">{formatCurrency(cartTotal * 1.15)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowPayment(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="primary" fullWidth onClick={processPayment}>
                {isRTL ? 'دفع' : 'Pay'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
