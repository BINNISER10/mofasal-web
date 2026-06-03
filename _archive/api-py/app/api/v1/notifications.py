from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.utils.response import success_response
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix='/notifications', tags=['Notifications'])


@router.get('/')
async def get_notifications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    total = len(notifications)
    return success_response({
        'notifications': [{
            'id': n.id, 'type': n.type.value.lower(), 'title': n.title, 'message': n.body or n.title,
            'isRead': n.is_read, 'createdAt': n.created_at.isoformat(),
        } for n in notifications],
        'total': total,
    })


@router.patch('/{notification_id}/read')
async def mark_as_read(notification_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    notif.is_read = True
    await db.commit()
    return success_response({'notification': {'id': notif.id, 'isRead': True}}, 'Marked as read')


@router.patch('/read-all')
async def mark_all_as_read(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(
        Notification.__table__.update().where(
            Notification.user_id == current_user.id, Notification.is_read == False
        ).values(is_read=True)
    )
    await db.commit()
    return success_response(None, 'All notifications marked as read')
