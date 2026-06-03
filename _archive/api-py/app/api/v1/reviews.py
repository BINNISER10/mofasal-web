from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.utils.response import success_response, created_response
from app.models.review import Review
from app.models.user import User

router = APIRouter(prefix='/reviews', tags=['Reviews'])


@router.post('/')
async def create_review(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = await db.execute(select(Review).where(Review.order_id == data['order_id']))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Review already exists for this order')

    review = Review(
        order_id=data['order_id'],
        user_id=current_user.id,
        shop_rating=data.get('shop_rating'),
        tailor_rating=data.get('tailor_rating'),
        representative_rating=data.get('representative_rating'),
        shop_review=data.get('shop_review'),
        tailor_review=data.get('tailor_review'),
        representative_review=data.get('representative_review'),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return created_response({'review': {'id': review.id}}, 'Review created')


@router.get('/order/{order_id}')
async def get_review(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Review).where(Review.order_id == order_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Review not found')
    return success_response({'review': {'id': review.id, 'shopRating': review.shop_rating, 'shopReview': review.shop_review}})


@router.get('/shop/{shop_id}')
async def get_shop_reviews(shop_id: str, db: AsyncSession = Depends(get_db)):
    from app.models.order import Order
    result = await db.execute(
        select(Review).join(Order, Review.order_id == Order.id).where(Order.shop_id == shop_id)
    )
    reviews = result.scalars().all()
    avg = await db.execute(select(func.avg(Review.shop_rating)).join(Order).where(Order.shop_id == shop_id))
    average = avg.scalar() or 0
    return success_response({
        'reviews': [{'id': r.id, 'shopRating': r.shop_rating, 'shopReview': r.shop_review, 'createdAt': r.created_at.isoformat()} for r in reviews],
        'averageRating': round(float(average), 1),
        'total': len(reviews),
    })
