'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi } from '@/lib/api/products';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

export default function AddProductPage() {
  const { isRTL } = useAppStore();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', nameAr: '', nameEn: '',
    description: '', descriptionAr: '',
    price: '', comparePrice: '', stock: '', minStock: '',
    category: '', unit: 'متر',
  });

  const handleSubmit = async () => {
    if (!form.nameAr.trim()) { toast.error(isRTL ? 'أدخل اسم المنتج' : 'Enter product name'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error(isRTL ? 'أدخل سعراً صحيحاً' : 'Enter valid price'); return; }
    setSaving(true);
    try {
      await productsApi.createJson({
        name: form.nameEn.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim(),
        description: form.descriptionAr.trim() || undefined,
        price: Number(form.price),
        compareAtPrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stockQuantity: form.stock ? Number(form.stock) : 0,
        unit: form.unit || undefined,
        images: images.length ? images : undefined,
        tags: form.category || undefined,
      });
      toast.success(isRTL ? 'تم إضافة المنتج' : 'Product added');
      router.push('/dashboard/merchant/products');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّرت الإضافة' : 'Failed to add'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">{isRTL ? 'إضافة منتج جديد' : 'Add New Product'}</h2>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4">{isRTL ? 'الصور' : 'Images'}</h3>
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
            </div>
          ))}
          <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
            <Upload size={24} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">{isRTL ? 'إضافة صورة' : 'Add Image'}</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4">{isRTL ? 'معلومات المنتج' : 'Product Info'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={`${isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'} *`} value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} placeholder="اسم المنتج بالعربية" required />
          <Input label={`${isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}`} value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})} placeholder="Product name in English" />
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'} *</label>
            <textarea className="input-field" rows={3} value={form.descriptionAr} onChange={(e) => setForm({...form, descriptionAr: e.target.value})} placeholder="وصف المنتج" required />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4">{isRTL ? 'التسعير والمخزون' : 'Pricing & Stock'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={`${isRTL ? 'السعر' : 'Price'} *`} type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="0" required />
          <Input label={isRTL ? 'السعر القديم' : 'Compare Price'} type="number" value={form.comparePrice} onChange={(e) => setForm({...form, comparePrice: e.target.value})} placeholder="0" />
          <Input label={isRTL ? 'المخزون' : 'Stock'} type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} placeholder="0" />
          <Input label={isRTL ? 'الحد الأدنى' : 'Min Stock'} type="number" value={form.minStock} onChange={(e) => setForm({...form, minStock: e.target.value})} placeholder="0" />
          <Input label={isRTL ? 'الفئة' : 'Category'} value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder={isRTL ? 'صوف / حرير / قطن' : 'Wool / Silk / Cotton'} />
          <Input label={isRTL ? 'الوحدة' : 'Unit'} value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} placeholder="متر / قطعة" />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={() => router.back()} disabled={saving}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
        <Button variant="primary" fullWidth onClick={handleSubmit} isLoading={saving} disabled={saving}>{isRTL ? 'إضافة المنتج' : 'Add Product'}</Button>
      </div>
    </div>
  );
}
