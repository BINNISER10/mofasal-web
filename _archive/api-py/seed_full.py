import asyncio, uuid, os, sys, logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
sys.stdout.reconfigure(encoding='utf-8', errors='replace') if hasattr(sys.stdout, 'reconfigure') else None
os.environ['PYTHONIOENCODING'] = 'utf-8'
from datetime import datetime, timezone
from app.database import engine, AsyncSession
from app.models.user import User
from app.models.shop import TailorShop, ShopService
from app.models.product import Product, Category
from app.models.enums import UserRole, UserStatus, ServiceType
from sqlalchemy import select
from passlib.context import CryptContext

pwd = CryptContext(schemes=['bcrypt'])

shops_data = [
    {'name': 'خياطة الرجال الراقية', 'city': 'الرياض', 'region': 'الرياض', 'phone': '+966500000011', 'owner_phone': '+966500000011', 'owner_name': 'أحمد القحطاني'},
    {'name': 'دار الأناقة للعبايات', 'city': 'جدة', 'region': 'مكة المكرمة', 'phone': '+966500000012', 'owner_phone': '+966500000012', 'owner_name': 'نورة الشمري'},
    {'name': 'بيت الخياطة الحديث', 'city': 'الدمام', 'region': 'الشرقية', 'phone': '+966500000013', 'owner_phone': '+966500000013', 'owner_name': 'ماجد الدوسري'},
    {'name': 'أتيليه الأزياء الراقية', 'city': 'جدة', 'region': 'مكة المكرمة', 'phone': '+966500000014', 'owner_phone': '+966500000014', 'owner_name': 'سارة الحربي'},
    {'name': 'بيت الثوب التقليدي', 'city': 'مكة المكرمة', 'region': 'مكة المكرمة', 'phone': '+966500000015', 'owner_phone': '+966500000015', 'owner_name': 'خالد الزهراني'},
    {'name': 'مشغل الخياطة النسائية', 'city': 'أبها', 'region': 'عسير', 'phone': '+966500000016', 'owner_phone': '+966500000016', 'owner_name': 'ريم العسيري'},
]

products_data = [
    {'name': 'صوف إيطالي فاخر', 'name_ar': 'صوف إيطالي فاخر', 'category_slug': 'mens', 'price': 320, 'stock': 50, 'attrs': {'material': 'صوف', 'origin': 'إيطالي', 'colors': ['#1a1a1a','#2c3e50','#5d4037','#1b5e20'], 'minMeters': 2}, 'tags': 'featured'},
    {'name': 'قطن مصري ممتاز', 'name_ar': 'قطن مصري ممتاز', 'category_slug': 'mens', 'price': 85, 'stock': 200, 'attrs': {'material': 'قطن', 'origin': 'مصري', 'colors': ['#ffffff','#f5f5f5','#bdbdbd','#4a148c'], 'minMeters': 1}},
    {'name': 'حرير طبيعي ناعم', 'name_ar': 'حرير طبيعي ناعم', 'category_slug': 'womens', 'price': 480, 'stock': 30, 'attrs': {'material': 'حرير', 'origin': 'هندي', 'colors': ['#f8bbd0','#e91e63','#880e4f','#fce4ec'], 'minMeters': 2}, 'tags': 'featured'},
    {'name': 'كتان تركي خفيف', 'name_ar': 'كتان تركي خفيف', 'category_slug': 'mens', 'price': 120, 'stock': 100, 'attrs': {'material': 'كتان', 'origin': 'تركي', 'colors': ['#f5f5dc','#d2b48c','#a0522d','#228b22'], 'minMeters': 2}},
    {'name': 'تريكو أطفال', 'name_ar': 'تريكو أطفال', 'category_slug': 'kids', 'price': 55, 'stock': 80, 'attrs': {'material': 'تريكو', 'origin': 'تركي', 'colors': ['#ff5722','#2196f3','#4caf50','#ffc107'], 'minMeters': 1}},
    {'name': 'قماش عباءة فاخر', 'name_ar': 'قماش عباءة فاخر', 'category_slug': 'womens', 'price': 165, 'stock': 0, 'attrs': {'material': 'بوليستر', 'origin': 'إماراتي', 'colors': ['#000000','#212121','#37474f'], 'minMeters': 3}, 'tags': 'featured'},
    {'name': 'بطانة ساتان', 'name_ar': 'بطانة ساتان', 'category_slug': 'lining', 'price': 45, 'stock': 150, 'attrs': {'material': 'حرير', 'origin': 'هندي', 'colors': ['#ffffff','#eeeeee','#bdbdbd'], 'minMeters': 1}},
    {'name': 'طقم أزرار', 'name_ar': 'طقم أزرار', 'category_slug': 'accessories', 'price': 25, 'stock': 300, 'attrs': {'material': 'بوليستر', 'origin': 'سعودي', 'colors': ['#795548','#9e9e9e','#ffd700'], 'minMeters': 1}},
    {'name': 'مخمل فاخر', 'name_ar': 'مخمل فاخر', 'category_slug': 'womens', 'price': 250, 'stock': 40, 'attrs': {'material': 'مخمل', 'origin': 'فرنسي', 'colors': ['#800020','#560027','#1a237e','#004d40'], 'minMeters': 2}, 'tags': 'featured'},
    {'name': 'دنيم قطني', 'name_ar': 'دنيم قطني', 'category_slug': 'mens', 'price': 90, 'stock': 120, 'attrs': {'material': 'دنيم', 'origin': 'أمريكي', 'colors': ['#1565c0','#0d47a1','#1a237e','#000000'], 'minMeters': 1}},
    {'name': 'شيفون شفاف', 'name_ar': 'شيفون شفاف', 'category_slug': 'womens', 'price': 75, 'stock': 90, 'attrs': {'material': 'شيفون', 'origin': 'تركي', 'colors': ['#fce4ec','#f3e5f5','#e0f2f1','#fff3e0'], 'minMeters': 1}},
    {'name': 'جلود طبيعية', 'name_ar': 'جلود طبيعية', 'category_slug': 'accessories', 'price': 350, 'stock': 25, 'attrs': {'material': 'جلد', 'origin': 'إيطالي', 'colors': ['#3e2723','#4e342e','#5d4037','#6d4c41'], 'minMeters': 1}},
    {'name': 'صوف ميرينو فاخر', 'name_ar': 'صوف ميرينو فاخر', 'category_slug': 'mens', 'price': 185, 'stock': 60, 'attrs': {'material': 'صوف', 'origin': 'أسترالي', 'colors': ['#607d8b','#455a64','#37474f','#263238'], 'minMeters': 2}},
    {'name': 'ساتان حريري', 'name_ar': 'ساتان حريري', 'category_slug': 'womens', 'price': 195, 'stock': 45, 'attrs': {'material': 'ساتان', 'origin': 'صيني', 'colors': ['#e91e63','#ad1457','#6a1b9a','#4a148c'], 'minMeters': 1}},
    {'name': 'خيوط تطريز ذهبية', 'name_ar': 'خيوط تطريز ذهبية', 'category_slug': 'accessories', 'price': 40, 'stock': 500, 'attrs': {'material': 'حرير', 'origin': 'سعودي', 'colors': ['#ffd700','#ffc107','#d4af37'], 'minMeters': 1}},
    {'name': 'قماش كتان طبيعي', 'name_ar': 'قماش كتان طبيعي', 'category_slug': 'mens', 'price': 110, 'stock': 75, 'attrs': {'material': 'كتان', 'origin': 'مصري', 'colors': ['#e0e0e0','#bdbdbd','#9e9e9e','#757575'], 'minMeters': 1}},
    {'name': 'قماش أطفال قطني', 'name_ar': 'قماش أطفال قطني', 'category_slug': 'kids', 'price': 45, 'stock': 200, 'attrs': {'material': 'قطن', 'origin': 'مصري', 'colors': ['#ffab91','#80cbc4','#ce93d8','#fff59d'], 'minMeters': 1}},
    {'name': 'بطانة صوف شتوية', 'name_ar': 'بطانة صوف شتوية', 'category_slug': 'lining', 'price': 65, 'stock': 60, 'attrs': {'material': 'صوف', 'origin': 'نيوزيلندي', 'colors': ['#8d6e63','#6d4c41','#5d4037','#4e342e'], 'minMeters': 1}},
    {'name': 'تيشيرت جيرسي', 'name_ar': 'تيشيرت جيرسي', 'category_slug': 'kids', 'price': 35, 'stock': 180, 'attrs': {'material': 'تريكو', 'origin': 'مصري', 'colors': ['#e70e0e','#2196f3','#4caf50','#ff9800'], 'minMeters': 1}},
    {'name': 'قماش بدلة رسمية', 'name_ar': 'قماش بدلة رسمية', 'category_slug': 'mens', 'price': 280, 'stock': 35, 'attrs': {'material': 'صوف', 'origin': 'إيطالي', 'colors': ['#1a237e','#01579b','#33691e','#4a148c'], 'minMeters': 2}},
]

cat_slug_map = {}

async def main():
    async with AsyncSession(engine) as s:
        cats = (await s.execute(select(Category))).scalars().all()
        for c in cats:
            cat_slug_map[c.slug] = c.id

        existing_users = {u.phone: u for u in (await s.execute(select(User))).scalars().all()}

        for sd in shops_data:
            phone = sd['owner_phone']
            user = existing_users.get(phone)
            if not user:
                user = User(
                    id=str(uuid.uuid4()),
                    name=sd['owner_name'],
                    phone=phone,
                    password=pwd.hash('Shop@123'),
                    role=UserRole.TAILOR_SHOP,
                    status=UserStatus.ACTIVE,
                )
                s.add(user)
                await s.flush()
                existing_users[phone] = user

            shop_check = await s.execute(select(TailorShop).where(TailorShop.owner_id == user.id))
            existing_shop = shop_check.scalar_one_or_none()
            if existing_shop:
                continue

            shop = TailorShop(
                owner_id=user.id,
                name=sd['name'],
                name_ar=sd['name'],
                phone=sd['phone'],
                city=sd['city'],
                region=sd['region'],
                status=UserStatus.ACTIVE,
                is_open=True,
                rating=4.5,
                estimated_arrival_minutes=60,
                commission_rate=0.1,
            )
            s.add(shop)
            await s.flush()

            svc1 = ShopService(shop_id=shop.id, service_type=ServiceType.TAILORING, name='khayata kamila', price=350, duration=60)
            svc2 = ShopService(shop_id=shop.id, service_type=ServiceType.ALTERATION, name='tadilat', price=100, duration=30)
            s.add_all([svc1, svc2])

        # Additional products for each shop
        shops = (await s.execute(select(TailorShop))).scalars().all()
        for idx, pdata in enumerate(products_data):
            cat_id = cat_slug_map.get(pdata['category_slug'])
            if not cat_id:
                continue
            shop = shops[idx % len(shops)]
            product = Product(
                merchant_id=shop.owner_id,
                name=pdata['name'],
                name_ar=pdata['name_ar'],
                category_id=cat_id,
                price=float(pdata['price']),
                stock_quantity=pdata['stock'],
                unit='meter',
                attributes=pdata['attrs'],
                tags=pdata.get('tags', ''),
                is_active=True,
                visibility='PUBLIC',
                rating=4.5,
                review_count=10 + idx * 5,
            )
            s.add(product)

        await s.commit()

asyncio.run(main())


asyncio.run(main())
