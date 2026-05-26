import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.enums import UserRole, UserStatus


class User(Base):
    __tablename__ = 'users'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.CUSTOMER)
    status: Mapped[UserStatus] = mapped_column(SAEnum(UserStatus), default=UserStatus.ACTIVE)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    addresses = relationship('UserAddress', back_populates='user', cascade='all, delete-orphan')
    measurements = relationship('UserMeasurement', back_populates='user', cascade='all, delete-orphan')
    tailor_profile = relationship('TailorProfile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    shop_staff = relationship('ShopStaff', back_populates='user')
    orders_as_customer = relationship('Order', back_populates='customer', foreign_keys='Order.customer_id')
    orders_as_staff = relationship('Order', back_populates='staff', foreign_keys='Order.staff_id')
    cart = relationship('Cart', back_populates='user', uselist=False, cascade='all, delete-orphan')
    reviews = relationship('Review', back_populates='user')
    sent_messages = relationship('Message', back_populates='sender')
    notifications = relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    audit_logs = relationship('AuditLog', back_populates='user')
    cart_items = relationship('CartItem', back_populates='user')


class UserAddress(Base):
    __tablename__ = 'user_addresses'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    street: Mapped[str] = mapped_column(String(255))
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str] = mapped_column(String(100))
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(10), default='SA')
    building_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    apartment_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship('User', back_populates='addresses')


class UserMeasurement(Base):
    __tablename__ = 'user_measurements'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(100))
    data: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship('User', back_populates='measurements')


class TailorProfile(Base):
    __tablename__ = 'tailor_profiles'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    shop_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id'), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    experience_years: Mapped[int | None] = mapped_column(nullable=True)
    bio: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    total_orders: Mapped[int] = mapped_column(default=0)

    user = relationship('User', back_populates='tailor_profile')
    shop = relationship('TailorShop', back_populates='tailors')
