from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.api.deps import get_current_user, get_optional_user, authorize
from app.utils.response import success_response, created_response, paginated_response
from app.models.product import Product, ProductVariant, Category, Cart, CartItem, InventoryMovement
from app.models.user import User
from app.models.enums import UserRole, InventoryMovementType
from typing import Optional

router = APIRouter(prefix='/products', tags=['Products'])


@router.get('/')
async def get_products(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    merchant_id: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    tags: Optional[str] = None,
):
    query = select(Product).options(selectinload(Product.category)).where(Product.is_active == True, Product.visibility == 'PUBLIC')
    if category_id:
        query = query.where(Product.category_id == category_id)
    if merchant_id:
        query = query.where(Product.merchant_id == merchant_id)
    if search:
        query = query.where(or_(Product.name.ilike(f'%{search}%'), Product.name_ar.ilike(f'%{search}%')))
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if tags:
        query = query.where(Product.tags.ilike(f'%{tags}%'))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    products = result.scalars().all()

    return paginated_response(
        [{'id': p.id, 'name': p.name, 'nameAr': p.name_ar, 'nameEn': p.name,
          'description': p.description, 'descAr': p.description,
          'price': p.price, 'pricePerMeter': p.price,
          'comparePrice': p.compare_at_price,
          'stock': p.stock_quantity, 'unit': p.unit, 'images': p.images or [],
          'category': p.category.name if p.category else None,
          'merchantName': '',
          'attributes': p.attributes or {},
          'material': (p.attributes or {}).get('material'),
          'origin': (p.attributes or {}).get('origin'),
          'colors': (p.attributes or {}).get('colors', []),
          'minMeters': (p.attributes or {}).get('minMeters', 1),
          'isFeatured': p.tags and 'featured' in p.tags.lower() if p.tags else False,
          'inStock': p.stock_quantity > 0,
          'tags': p.tags.split(',') if p.tags else [],
          'rating': p.rating, 'reviewCount': p.review_count,
        } for p in products],
        total, page, limit,
    )


@router.get('/{product_id}')
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.category), selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Product not found')
    return success_response({
        'id': product.id, 'name': product.name, 'nameAr': product.name_ar,
        'description': product.description, 'price': product.price,
        'comparePrice': product.compare_at_price, 'stock': product.stock_quantity,
        'images': product.images or [], 'category': product.category.name if product.category else None,
        'variants': [{'id': v.id, 'name': v.name, 'value': v.value, 'price': v.price, 'stock': v.stock_quantity} for v in product.variants],
    })


@router.post('/')
async def create_product(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.MERCHANT.value, UserRole.ADMIN.value))):
    product = Product(
        merchant_id=current_user.id,
        **{k: v for k, v in data.items() if k in ('name', 'name_ar', 'description', 'price', 'compare_at_price', 'cost_price', 'stock_quantity', 'unit', 'images', 'visibility', 'is_active', 'tags', 'attributes', 'category_id', 'rating', 'review_count')}
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return created_response({'id': product.id, 'name': product.name}, 'Product created')


@router.get('/categories/list')
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True).order_by(Category.order))
    cats = result.scalars().all()
    return success_response({
        'categories': [{'id': c.id, 'name': c.name, 'nameAr': c.name_ar, 'slug': c.slug, 'image': c.image, 'parentId': c.parent_id} for c in cats]
    })


@router.post('/cart/add')
async def add_to_cart(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart_result = await db.execute(select(Cart).where(Cart.user_id == current_user.id))
    cart = cart_result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        await db.flush()

    item = CartItem(cart_id=cart.id, product_id=data['product_id'], quantity=data.get('quantity', 1), user_id=current_user.id)
    db.add(item)
    await db.commit()
    return created_response(None, 'Item added to cart')


@router.get('/cart/my')
async def get_cart(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Cart).options(selectinload(Cart.items)).where(Cart.user_id == current_user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        return success_response({'items': []})
    return success_response({
        'items': [{'id': i.id, 'productId': i.product_id, 'quantity': i.quantity} for i in cart.items]
    })
