import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.enums import DeliveryProvider, DeliveryStatus


class DeliveryRequest(Base):
    __tablename__ = 'delivery_requests'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), unique=True, index=True)
    provider: Mapped[DeliveryProvider] = mapped_column(SAEnum(DeliveryProvider), index=True)
    status: Mapped[DeliveryStatus] = mapped_column(SAEnum(DeliveryStatus), default=DeliveryStatus.PENDING, index=True)
    driver_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    driver_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tracking_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    estimated_arrival: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_arrival: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    waybill_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship('Order', back_populates='delivery_request')
    tracking = relationship('DeliveryTracking', back_populates='delivery_request', cascade='all, delete-orphan')


class DeliveryTracking(Base):
    __tablename__ = 'delivery_tracking'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    delivery_request_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('delivery_requests.id', ondelete='CASCADE'), index=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str | None] = mapped_column(String(30), nullable=True)

    delivery_request = relationship('DeliveryRequest', back_populates='tracking')
