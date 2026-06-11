from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.api.deps import get_current_user
from app.utils.response import success_response, created_response
from app.models.conversation import Conversation, Message
from app.models.user import User

router = APIRouter(prefix='/conversations', tags=['Conversations'])


@router.get('/order/{order_id}')
async def get_conversation_by_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Conversation).options(selectinload(Conversation.messages).selectinload(Message.sender)).where(Conversation.order_id == order_id))
    conv = result.scalar_one_or_none()
    if not conv:
        conv = Conversation(order_id=order_id)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        return success_response({
            'conversation': {
                'id': conv.id,
                'orderId': conv.order_id,
                'messages': [],
                'unreadCount': 0,
            }
        })
    return success_response({
        'conversation': {
            'id': conv.id,
            'orderId': conv.order_id,
            'messages': [{'id': m.id, 'content': m.content, 'senderName': m.sender.name, 'senderRole': m.sender.role.value, 'isRead': m.read_at is not None, 'createdAt': m.created_at.isoformat()} for m in conv.messages],
            'unreadCount': sum(1 for m in conv.messages if m.read_at is None and m.sender_id != current_user.id),
        }
    })


@router.post('/order/{order_id}/message')
async def send_message(order_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Conversation).where(Conversation.order_id == order_id))
    conv = result.scalar_one_or_none()
    if not conv:
        conv = Conversation(order_id=order_id)
        db.add(conv)
        await db.flush()

    msg = Message(conversation_id=conv.id, sender_id=current_user.id, content=data.get('content'), type=data.get('type', 'TEXT'), media_url=data.get('media_url'))
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return created_response({'message': {'id': msg.id, 'content': msg.content, 'createdAt': msg.created_at.isoformat()}}, 'Message sent')
