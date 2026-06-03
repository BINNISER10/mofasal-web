import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.enums import OrderStatus, PaymentStatus, PaymentMethod, ServiceType, LocationType


class ServiceRequest(Base):
    __tablename__ = 'service_requests'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), index=True)
    shop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id'), index=True)
    service_type: Mapped[ServiceType] = mapped_column(SAEnum(ServiceType))
    status: Mapped[str] = mapped_column(String(20), default='PENDING', index=True)
    location_type: Mapped[LocationType | None] = mapped_column(SAEnum(LocationType), nullable=True)
    address_id: Mapped[str | None] = mapped_column(nullable=True)
    custom_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    customer = relationship('User', backref='service_requests')
    shop = relationship('TailorShop', back_populates='service_requests')
    order = relationship('Order', back_populates='service_request', uselist=False)


class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    customer_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), index=True)
    shop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id'), index=True)
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), default=OrderStatus.PENDING, index=True)
    service_request_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('service_requests.id'), unique=True, nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, default=0)
    vat_amount: Mapped[float] = mapped_column(Float, default=0)
    delivery_fee: Mapped[float] = mapped_column(Float, default=0)
    grand_total: Mapped[float] = mapped_column(Float, default=0)
    payment_status: Mapped[PaymentStatus] = mapped_column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    payment_method: Mapped[PaymentMethod | None] = mapped_column(SAEnum(PaymentMethod), nullable=True)
    delivery_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmation_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    customer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    staff_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    staff_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship('User', back_populates='orders_as_customer', foreign_keys='Order.customer_id')
    staff = relationship('User', back_populates='orders_as_staff', foreign_keys='Order.staff_id')
    shop = relationship('TailorShop', back_populates='orders')
    service_request = relationship('ServiceRequest', back_populates='order')
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
    measurements = relationship('OrderMeasurement', back_populates='order', cascade='all, delete-orphan')
    status_history = relationship('OrderStatusHistory', back_populates='order', cascade='all, delete-orphan')
    tracking = relationship('OrderTracking', back_populates='order', cascade='all, delete-orphan')
    confirmation_link = relationship('ConfirmationLink', back_populates='order', uselist=False, cascade='all, delete-orphan')
    fabric_details = relationship('FabricDetails', back_populates='order', cascade='all, delete-orphan')
    delivery_request = relationship('DeliveryRequest', back_populates='order', uselist=False, cascade='all, delete-orphan')
    payment_transactions = relationship('PaymentTransaction', back_populates='order', cascade='all, delete-orphan')
    invoices = relationship('Invoice', back_populates='order', cascade='all, delete-orphan')
    review = relationship('Review', back_populates='order', uselist=False, cascade='all, delete-orphan')
    conversation = relationship('Conversation', back_populates='order', uselist=False, cascade='all, delete-orphan')


class OrderItem(Base):
    __tablename__ = 'order_items'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    product_id: Mapped[str | None] = mapped_column(nullable=True)
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Float)
    total_price: Mapped[float] = mapped_column(Float)

    order = relationship('Order', back_populates='items')


class OrderMeasurement(Base):
    __tablename__ = 'order_measurements'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    measurement_data: Mapped[dict] = mapped_column(JSONB)
    tailor_id: Mapped[str | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    order = relationship('Order', back_populates='measurements')


class OrderStatusHistory(Base):
    __tablename__ = 'order_status_history'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    from_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    to_status: Mapped[str] = mapped_column(String(30))
    changed_by: Mapped[str | None] = mapped_column(nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    order = relationship('Order', back_populates='status_history')


class OrderTracking(Base):
    __tablename__ = 'order_tracking'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    status: Mapped[str] = mapped_column(String(30))
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    order = relationship('Order', back_populates='tracking')


class ConfirmationLink(Base):
    __tablename__ = 'confirmation_links'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), unique=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    measurements: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    fabric_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    final_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    delivery_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    customer_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    customer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship('Order', back_populates='confirmation_link')


class FabricDetails(Base):
    __tablename__ = 'fabric_details'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    fabric_type: Mapped[str] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pattern: Mapped[str | None] = mapped_column(String(100), nullable=True)
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), default='meter')
    source: Mapped[str | None] = mapped_column(String(200), nullable=True)
    merchant_id: Mapped[str | None] = mapped_column(nullable=True)

    order = relationship('Order', back_populates='fabric_details')
