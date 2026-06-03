import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Review(Base):
    __tablename__ = 'reviews'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), index=True)
    shop_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tailor_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    representative_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shop_review: Mapped[str | None] = mapped_column(Text, nullable=True)
    tailor_review: Mapped[str | None] = mapped_column(Text, nullable=True)
    representative_review: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship('Order', back_populates='review')
    user = relationship('User', back_populates='reviews')
