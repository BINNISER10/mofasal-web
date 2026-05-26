from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response, created_response
from app.models.order import ServiceRequest
from app.models.user import User
from app.models.enums import UserRole

router = APIRouter(prefix='/services', tags=['Service Requests'])


@router.post('/')
async def create_service_request(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    sr = ServiceRequest(customer_id=current_user.id, **{k: v for k, v in data.items() if k in ('shop_id', 'service_type', 'location_type', 'address_id', 'custom_address', 'scheduled_date', 'preferred_time', 'notes')})
    db.add(sr)
    await db.commit()
    await db.refresh(sr)
    return created_response({'serviceRequest': {'id': sr.id}}, 'Service request created')


@router.get('/')
async def get_service_requests(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(ServiceRequest)
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(ServiceRequest.customer_id == current_user.id)
    result = await db.execute(query)
    requests = result.scalars().all()
    return success_response({
        'serviceRequests': [{'id': r.id, 'serviceType': r.service_type.value, 'status': r.status, 'createdAt': r.created_at.isoformat()} for r in requests]
    })


@router.get('/{request_id}')
async def get_service_request(request_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ServiceRequest).where(ServiceRequest.id == request_id))
    sr = result.scalar_one_or_none()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return success_response({
        'id': sr.id, 'serviceType': sr.service_type.value, 'status': sr.status, 'notes': sr.notes, 'createdAt': sr.created_at.isoformat()
    })
