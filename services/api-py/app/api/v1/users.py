from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.schemas.user import UpdateUserRequest, AddressRequest, MeasurementRequest
from app.utils.response import success_response, created_response, paginated_response
from app.models.user import User, UserAddress, UserMeasurement
from app.models.enums import UserRole

router = APIRouter(prefix='/users', tags=['Users'])


@router.get('/')
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value)),
    page: int = 1,
    limit: int = 20,
):
    result = await db.execute(select(User).offset((page - 1) * limit).limit(limit))
    users = result.scalars().all()
    total_result = await db.execute(select(User))
    total = len(total_result.scalars().all())
    return paginated_response(
        [{'id': u.id, 'name': u.name, 'phone': u.phone, 'email': u.email, 'role': u.role.value, 'status': u.status.value, 'createdAt': u.created_at.isoformat(), 'ordersCount': len(u.orders_as_customer)} for u in users],
        total, page, limit,
    )


@router.get('/{user_id}')
async def get_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return success_response({
        'id': user.id, 'name': user.name, 'phone': user.phone, 'email': user.email,
        'role': user.role.value, 'status': user.status.value, 'avatar': user.avatar,
        'createdAt': user.created_at.isoformat(),
    })


@router.put('/{user_id}')
async def update_user(user_id: str, data: UpdateUserRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    await db.commit()
    return success_response({'id': user.id}, 'User updated')


@router.get('/{user_id}/addresses')
async def get_addresses(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserAddress).where(UserAddress.user_id == user_id))
    addresses = result.scalars().all()
    return success_response({
        'addresses': [{'id': a.id, 'label': a.label, 'street': a.street, 'district': a.district, 'city': a.city, 'region': a.region, 'buildingNumber': a.building_number, 'apartmentNumber': a.apartment_number, 'isDefault': a.is_default} for a in addresses]
    })


@router.post('/{user_id}/addresses')
async def create_address(user_id: str, data: AddressRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    addr = UserAddress(user_id=user_id, **data.model_dump())
    db.add(addr)
    await db.commit()
    await db.refresh(addr)
    return created_response({'address': {'id': addr.id, 'street': addr.street, 'city': addr.city}}, 'Address created')


@router.put('/{user_id}/addresses/{address_id}')
async def update_address(user_id: str, address_id: str, data: AddressRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user_id))
    addr = result.scalar_one_or_none()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Address not found')
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(addr, key, value)
    await db.commit()
    return success_response({'address': {'id': addr.id}}, 'Address updated')


@router.delete('/{user_id}/addresses/{address_id}')
async def delete_address(user_id: str, address_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserAddress).where(UserAddress.id == address_id, UserAddress.user_id == user_id))
    addr = result.scalar_one_or_none()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Address not found')
    await db.delete(addr)
    await db.commit()
    return success_response(None, 'Address deleted')


@router.get('/{user_id}/measurements')
async def get_measurements(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserMeasurement).where(UserMeasurement.user_id == user_id))
    measurements = result.scalars().all()
    return success_response({
        'measurements': [{'id': m.id, 'name': m.name, 'data': m.data, 'createdAt': m.created_at.isoformat()} for m in measurements]
    })


@router.post('/{user_id}/measurements')
async def create_measurement(user_id: str, data: MeasurementRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    meas = UserMeasurement(user_id=user_id, **data.model_dump())
    db.add(meas)
    await db.commit()
    await db.refresh(meas)
    return created_response({'measurement': {'id': meas.id, 'name': meas.name}}, 'Measurement created')
