"""Create sample fabric products."""
import requests, time

BASE = 'http://localhost:4001/api/v1'

r = requests.post(f'{BASE}/auth/login', json={'phone': '+966500000003', 'password': 'Merc@123'})
t = r.json()['data']['access_token']
h = {'Authorization': f'Bearer {t}', 'Content-Type': 'application/json'}

r = requests.get(f'{BASE}/products/categories/list')
cats = {c['slug']: c['id'] for c in r.json()['data']['categories']}
print('Categories:', cats)

products = [
    ('Italian Luxury Wool', 'صوف إيطالي فاخر', 'Luxury Italian wool', 320, 50, 'mens', True,
     {'material':'صوف','origin':'إيطالي','colors':['#1a1a1a','#2c3e50','#5d4037','#1b5e20'],'minMeters':2}),
    ('Premium Egyptian Cotton', 'قطن مصري ممتاز', 'Premium Egyptian cotton', 85, 200, 'mens', False,
     {'material':'قطن','origin':'مصري','colors':['#ffffff','#f5f5f5','#bdbdbd','#4a148c'],'minMeters':1}),
    ('Natural Smooth Silk', 'حرير طبيعي ناعم', 'Natural silk', 480, 30, 'womens', True,
     {'material':'حرير','origin':'هندي','colors':['#f8bbd0','#e91e63','#880e4f','#fce4ec'],'minMeters':2}),
    ('Turkish Light Linen', 'كتان تركي خفيف', 'Light linen', 120, 100, 'mens', False,
     {'material':'كتان','origin':'تركي','colors':['#f5f5dc','#d2b48c','#a0522d','#228b22'],'minMeters':2}),
    ('Kids Colorful Knit', 'تريكو أطفال', 'Colorful knit', 55, 80, 'kids', False,
     {'material':'تريكو','origin':'تركي','colors':['#ff5722','#2196f3','#4caf50','#ffc107'],'minMeters':1}),
    ('Luxury Abaya Fabric', 'قماش عباءة فاخر', 'Luxury abaya fabric', 165, 0, 'womens', True,
     {'material':'بوليستر','origin':'إماراتي','colors':['#000000','#212121','#37474f'],'minMeters':3}),
    ('Smooth Satin Lining', 'بطانة ساتان', 'Smooth satin lining', 45, 150, 'accessories', False,
     {'material':'حرير','origin':'هندي','colors':['#ffffff','#eeeeee','#bdbdbd'],'minMeters':1}),
    ('Sewing Buttons Set', 'طقم أزرار', 'High quality buttons set', 25, 300, 'accessories', False,
     {'material':'بوليستر','origin':'سعودي','colors':['#795548','#9e9e9e','#ffd700'],'minMeters':1}),
]

for name, name_ar, desc, price, stock, cat_slug, featured, attrs in products:
    payload = {
        'name': name, 'name_ar': name_ar, 'description': desc,
        'price': price, 'stock_quantity': stock, 'unit': 'meter',
        'attributes': attrs, 'category_id': cats.get(cat_slug),
    }
    if featured:
        payload['tags'] = 'featured'
    r = requests.post(f'{BASE}/products/', json=payload, headers=h, timeout=10)
    ok = 'OK' if r.status_code in (200, 201) else 'FAIL'
    print(f'  {ok} [{name}]: {r.status_code}')

r = requests.get(f'{BASE}/products/')
d = r.json()
print(f'\nTotal products: {d["data"]["total"]}')
for item in d['data']['items']:
    print(f'  - {item["name"]}: SR{item["price"]}, {item.get("material","?")}, {item.get("origin","?")}')
