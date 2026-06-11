from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response, created_response
from app.models.delivery import DeliveryRequest, DeliveryTracking
from app.models.user import User
from app.models.enums import UserRole, DeliveryProvider, DeliveryStatus

router = APIRouter(prefix='/delivery', tags=['Delivery'])


@router.post('/')
async def create_delivery(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR_SHOP.value))):
    delivery = DeliveryRequest(
        order_id=data['order_id'],
        provider=DeliveryProvider(data.get('provider', 'SHOP_VEHICLE')),
    )
    db.add(delivery)
    await db.commit()
    await db.refresh(delivery)
    return created_response({'delivery': {'id': delivery.id}}, 'Delivery created')


@router.get('/order/{order_id}')
async def get_delivery_by_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DeliveryRequest).where(DeliveryRequest.order_id == order_id))
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No delivery found for this order')
    return success_response({
        'id': delivery.id, 'provider': delivery.provider.value, 'status': delivery.status.value,
        'driverName': delivery.driver_name, 'driverPhone': delivery.driver_phone,
        'trackingUrl': delivery.tracking_url, 'estimatedArrival': delivery.estimated_arrival.isoformat() if delivery.estimated_arrival else None,
    })
