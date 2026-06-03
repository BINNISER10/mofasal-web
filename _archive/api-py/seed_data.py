"""Seed script: create categories, products, and shops."""
import requests, json, sys

BASE = 'http://localhost:4001/api/v1'

def login(phone, password):
    r = requests.post(f'{BASE}/auth/login', json={'phone': phone, 'password': password})
    if r.status_code != 200:
        print(f'Login failed for {phone}: {r.text[:200]}')
        sys.exit(1)
    return r.json()['data']['access_token']

# Login as merchant (+966500000003 / Merc@123)
merchant_token = login('+966500000003', 'Merc@123')
m_hdrs = {'Authorization': f'Bearer {merchant_token}', 'Content-Type': 'application/json'}

# Login as tailor_shop (+966500000022 / Shop@123)
shop_token = login('+966500000022', 'Shop@123')
s_hdrs = {'Authorization': f'Bearer {shop_token}', 'Content-Type': 'application/json'}

# Create categories
cat_ids = {}
for slug, name, name_ar in [
    ('mens', "Mens Fabrics", 'أقمشة رجالية'),
    ('womens', "Womens Fabrics", 'أقمشة نسائية'),
    ('kids', 'Kids Fabrics', 'أقمشة أطفال'),
    ('accessories', 'Accessories', 'إكسسوارات'),
]:
    r = requests.post(f'{BASE}/categories/', json={'name': name, 'name_ar': name_ar, 'slug': slug}, headers=m_hdrs)
    if r.status_code in (200, 201):
        cid = r.json()['data'].get('id')
        cat_ids[slug] = cid
        print(f'OK category [{slug}]: {cid}')
    else:
        print(f'FAIL category [{slug}]: {r.text[:150]}')

# Create fabric products
products_data = [
    ('Italian Luxury Wool', 'صوف إيطالي فاخر', 'Luxury Italian wool for suits and thobes', 320, 'mens', 50, True,
     {'material': 'صوف', 'origin': 'إيطالي', 'colors': ['#1a1a1a', '#2c3e50', '#5d4037', '#1b5e20'], 'minMeters': 2}),
    ('Premium Egyptian Cotton', 'قطن مصري ممتاز', 'Premium Egyptian cotton for shirts', 85, 'mens', 200, True,
     {'material': 'قطن', 'origin': 'مصري', 'colors': ['#ffffff', '#f5f5f5', '#bdbdbd', '#4a148c'], 'minMeters': 1}),
    ('Natural Smooth Silk', 'حرير طبيعي ناعم', 'Natural silk for special occasions', 480, 'womens', 30, True,
     {'material': 'حرير', 'origin': 'هندي', 'colors': ['#f8bbd0', '#e91e63', '#880e4f', '#fce4ec'], 'minMeters': 2}),
    ('Turkish Light Linen', 'كتان تركي خفيف', 'Light linen for summer', 120, 'mens', 100, False,
     {'material': 'كتان', 'origin': 'تركي', 'colors': ['#f5f5dc', '#d2b48c', '#a0522d', '#228b22'], 'minMeters': 2}),
    ('Kids Colorful Knit', 'تريكو أطفال ألوان', 'Colorful knit fabric for kids', 55, 'kids', 80, False,
     {'material': 'تريكو', 'origin': 'تركي', 'colors': ['#ff5722', '#2196f3', '#4caf50', '#ffc107'], 'minMeters': 1}),
    ('Luxury Abaya Fabric', 'قماش عباءة فاخر', 'Luxury abaya fabric with gold threads', 165, 'womens', 0, True,
     {'material': 'بوليستر', 'origin': 'إماراتي', 'colors': ['#000000', '#212121', '#37474f'], 'minMeters': 3}),
    ('Smooth Satin Lining', 'بطانة ساتان ناعمة', 'Smooth satin lining for premium finish', 45, 'accessories', 150, False,
     {'material': 'حرير', 'origin': 'هندي', 'colors': ['#ffffff', '#eeeeee', '#bdbdbd'], 'minMeters': 1}),
    ('Sewing Buttons Set', 'طقم أزرار خياطة', 'High quality buttons set', 25, 'accessories', 300, False,
     {'material': 'بوليستر', 'origin': 'سعودي', 'colors': ['#795548', '#9e9e9e', '#ffd700'], 'minMeters': 1}),
]

for name, name_ar, desc, price, cat_slug, stock, featured, attrs in products_data:
    cat_id = cat_ids.get(cat_slug)
    payload = {
        'name': name, 'name_ar': name_ar, 'description': desc,
        'price': price, 'stock_quantity': stock, 'unit': 'meter',
        'attributes': attrs,
        'category_id': cat_id,
    }
    if featured:
        payload['tags'] = 'featured'
    r = requests.post(f'{BASE}/products/', json=payload, headers=m_hdrs)
    status = 'OK' if r.status_code in (200, 201) else 'FAIL'
    print(f'{status} product [{name}]: {r.status_code}')

# Create a shop with the tailor_shop user
shop_data = {
    'name': 'Luxury Tailoring House',
    'name_ar': 'دار الخياطة الفاخرة',
    'description': 'Premium men tailoring in Riyadh - suits, thobes, and traditional wear',
    'phone': '+966500000022',
    'city': 'Riyadh',
    'region': 'Riyadh',
    'lat': 24.7136, 'lng': 46.6753,
}
r = requests.post(f'{BASE}/shops/', json=shop_data, headers=s_hdrs)
print(f'Shop creation: {r.status_code} {r.text[:200]}')

# Verify — list products
r = requests.get(f'{BASE}/products/')
d = r.json()
print(f'\nTotal products: {d["data"]["total"]}')
for item in d['data']['items'][:3]:
    print(f'  - {item["name"]}: SR {item["price"]}, mat={item.get("material")}, origin={item.get("origin")}')

# List shops
r = requests.get(f'{BASE}/shops/')
print(f'\nTotal shops: {r.json()["data"]["total"]}')
