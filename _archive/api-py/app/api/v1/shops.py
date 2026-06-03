from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.api.deps import get_current_user, get_optional_user, authorize
from app.utils.response import success_response, created_response, paginated_response
from app.models.shop import TailorShop, ShopService, ShopVehicle, ShopStaff
from app.models.user import User, TailorProfile
from app.models.enums import UserRole, ServiceType
from typing import Optional

router = APIRouter(prefix='/shops', tags=['Shops'])


@router.get('/')
async def get_shops(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    region: Optional[str] = None,
    service_type: Optional[str] = None,
    min_rating: Optional[float] = None,
    search: Optional[str] = None,
    is_open: Optional[bool] = None,
):
    query = select(TailorShop).where(TailorShop.status == 'ACTIVE')
    if city:
        query = query.where(TailorShop.city.ilike(f'%{city}%'))
    if region:
        query = query.where(TailorShop.region.ilike(f'%{region}%'))
    if min_rating:
        query = query.where(TailorShop.rating >= min_rating)
    if search:
        query = query.where(or_(TailorShop.name.ilike(f'%{search}%'), TailorShop.name_ar.ilike(f'%{search}%')))
    if is_open is not None:
        query = query.where(TailorShop.is_open == is_open)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0

    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    shops = result.scalars().all()

    return paginated_response(
        [{
            'id': s.id, 'name': s.name, 'nameAr': s.name_ar, 'description': s.description,
            'logo': s.logo, 'coverImage': s.cover_image, 'city': s.city, 'region': s.region,
            'rating': s.rating, 'orderCount': s.total_orders, 'isOpen': s.is_open,
            'isVerified': s.status == 'ACTIVE', 'commission': s.commission_rate,
            'estimatedDeliveryTime': s.estimated_arrival_minutes,
        } for s in shops],
        total, page, limit,
    )


@router.get('/{shop_id}')
async def get_shop(shop_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TailorShop).options(selectinload(TailorShop.owner)).where(TailorShop.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Shop not found')
    return success_response({
        'id': shop.id, 'name': shop.name, 'nameAr': shop.name_ar, 'description': shop.description,
        'logo': shop.logo, 'coverImage': shop.cover_image, 'ownerName': shop.owner.name,
        'phone': shop.phone, 'email': shop.email, 'city': shop.city,
        'rating': shop.rating, 'orderCount': shop.total_orders,
        'isOpen': shop.is_open, 'isVerified': shop.status == 'ACTIVE',
        'status': shop.status.value, 'commission': shop.commission_rate,
    })


@router.post('/')
async def create_shop(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR_SHOP.value))):
    shop = TailorShop(owner_id=current_user.id, **{k: v for k, v in data.items() if k in ('name', 'name_ar', 'description', 'logo', 'phone', 'email', 'city', 'region', 'lat', 'lng')})
    db.add(shop)
    await db.commit()
    await db.refresh(shop)
    return created_response({'shop': {'id': shop.id, 'name': shop.name}}, 'Shop created')


@router.get('/{shop_id}/services')
async def get_services(shop_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShopService).where(ShopService.shop_id == shop_id, ShopService.is_active == True))
    services = result.scalars().all()
    return success_response({
        'services': [{'id': s.id, 'name': s.name, 'serviceType': s.service_type.value, 'price': s.price, 'duration': s.duration} for s in services]
    })


@router.post('/{shop_id}/services')
async def create_service(shop_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR_SHOP.value))):
    svc = ShopService(shop_id=shop_id, **{k: v for k, v in data.items() if k in ('service_type', 'name', 'description', 'price', 'duration')})
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return created_response({'service': {'id': svc.id}}, 'Service created')


@router.get('/{shop_id}/vehicles')
async def get_vehicles(shop_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ShopVehicle).where(ShopVehicle.shop_id == shop_id))
    vehicles = result.scalars().all()
    return success_response({
        'vehicles': [{'id': v.id, 'plateNumber': v.plate_number, 'driverName': v.driver_name, 'driverPhone': v.driver_phone} for v in vehicles]
    })


@router.patch('/{shop_id}/toggle-open')
async def toggle_open(shop_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR_SHOP.value))):
    result = await db.execute(select(TailorShop).where(TailorShop.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    shop.is_open = not shop.is_open
    await db.commit()
    return success_response({'isOpen': shop.is_open}, 'Shop status toggled')
