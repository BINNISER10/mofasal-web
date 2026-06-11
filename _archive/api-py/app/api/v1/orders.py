import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response, created_response, paginated_response
from app.models.order import Order, OrderItem, OrderMeasurement, OrderStatusHistory, OrderTracking
from app.models.user import User
from app.models.enums import UserRole
from typing import Optional

router = APIRouter(prefix='/orders', tags=['Orders'])


@router.post('/')
async def create_order(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        customer_id=current_user.id,
        shop_id=data['shop_id'],
        total_amount=data.get('total_amount', 0),
        delivery_fee=data.get('delivery_fee', 0),
        customer_notes=data.get('customer_notes'),
        order_number=f'ORD-{order_id[:8].upper()}',
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return created_response({'order': {'id': order.id, 'orderNumber': order.order_number}}, 'Order created')


@router.get('/')
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias='status'),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Order).options(selectinload(Order.customer), selectinload(Order.shop), selectinload(Order.items))
    if current_user.role in (UserRole.CUSTOMER,):
        query = query.where(Order.customer_id == current_user.id)
    elif current_user.role in (UserRole.TAILOR_SHOP, UserRole.TAILOR, UserRole.STAFF):
        query = query.where(Order.shop_id == current_user.shop_id if hasattr(current_user, 'shop_id') else False)
    if status_filter:
        query = query.where(Order.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit))
    orders = result.scalars().all()

    return paginated_response(
        [{'id': o.id, 'orderNumber': o.order_number, 'customerName': o.customer.name, 'shopName': o.shop.name,
          'status': o.status.value, 'totalAmount': o.total_amount, 'grandTotal': o.grand_total,
          'paymentMethod': o.payment_method.value if o.payment_method else None,
          'createdAt': o.created_at.isoformat(), 'items': [{'name': i.name, 'quantity': i.quantity} for i in o.items]} for o in orders],
        total, page, limit,
    )


@router.get('/stats')
async def get_order_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Order.status, func.count()).group_by(Order.status))
    stats = {row[0].value if hasattr(row[0], 'value') else row[0]: row[1] for row in result.all()}
    return success_response(stats)


@router.get('/{order_id}')
async def get_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Order).options(selectinload(Order.customer), selectinload(Order.shop), selectinload(Order.items), selectinload(Order.measurements)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    return success_response({
        'id': order.id, 'orderNumber': order.order_number,
        'customerName': order.customer.name, 'customerPhone': order.customer.phone,
        'shopName': order.shop.name, 'status': order.status.value,
        'totalAmount': order.total_amount, 'deliveryFee': order.delivery_fee,
        'vatAmount': order.vat_amount, 'grandTotal': order.grand_total,
        'paymentMethod': order.payment_method.value if order.payment_method else None,
        'paymentStatus': order.payment_status.value,
        'customerNotes': order.customer_notes, 'createdAt': order.created_at.isoformat(),
        'items': [{'name': i.name, 'quantity': i.quantity, 'unitPrice': i.unit_price} for i in order.items],
        'measurements': [{'data': m.measurement_data, 'notes': m.notes} for m in order.measurements],
    })


@router.patch('/{order_id}/status')
async def update_order_status(order_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    history = OrderStatusHistory(order_id=order_id, from_status=order.status.value, to_status=data['status'], changed_by=current_user.id, note=data.get('note'))
    order.status = data['status']
    db.add(history)
    await db.commit()
    return success_response({'status': order.status.value}, 'Status updated')


@router.post('/{order_id}/measurements')
async def add_measurement(order_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR.value, UserRole.TAILOR_SHOP.value))):
    meas = OrderMeasurement(order_id=order_id, measurement_data=data['measurement_data'], tailor_id=current_user.id, notes=data.get('notes'))
    db.add(meas)
    await db.commit()
    return created_response(None, 'Measurement added')


@router.post('/{order_id}/fabric')
async def add_fabric(order_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR.value, UserRole.TAILOR_SHOP.value))):
    from app.models.order import FabricDetails
    fabric = FabricDetails(order_id=order_id, **{k: v for k, v in data.items() if k in ('fabric_type', 'color', 'pattern', 'quantity', 'unit', 'source', 'merchant_id')})
    db.add(fabric)
    await db.commit()
    return created_response(None, 'Fabric details added')


@router.get('/{order_id}/tracking')
async def get_tracking(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(OrderTracking).where(OrderTracking.order_id == order_id).order_by(OrderTracking.timestamp))
    tracking = result.scalars().all()
    return success_response({
        'tracking': [{'id': t.id, 'status': t.status, 'description': t.description, 'timestamp': t.timestamp.isoformat()} for t in tracking]
    })
