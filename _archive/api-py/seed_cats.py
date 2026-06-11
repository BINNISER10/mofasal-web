"""Direct DB + API seed for categories, products, shops."""
import asyncio, sys
sys.path.insert(0, '.')
from app.database import async_session
from app.models.product import Category
from sqlalchemy import select

async def seed_categories():
    async with async_session() as session:
        for slug, name, name_ar in [
            ('mens', "Men's Fabrics", 'أقمشة رجالية'),
            ('womens', "Women's Fabrics", 'أقمشة نسائية'),
            ('kids', "Kids Fabrics", 'أقمشة أطفال'),
            ('accessories', 'Accessories', 'إكسسوارات'),
            ('lining', 'Lining', 'بطانات'),
        ]:
            existing = await session.execute(select(Category).where(Category.slug == slug))
            if existing.scalar_one_or_none():
                print(f'Category [{slug}] exists')
                continue
            cat = Category(name=name, name_ar=name_ar, slug=slug)
            session.add(cat)
        await session.commit()
        print('Categories seeded')

asyncio.run(seed_categories())
