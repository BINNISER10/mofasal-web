import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.enums import UserStatus, ServiceType


class TailorShop(Base):
    __tablename__ = 'tailor_shops'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'))
    name: Mapped[str] = mapped_column(String(200))
    name_ar: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0, index=True)
    total_orders: Mapped[int] = mapped_column(default=0)
    status: Mapped[UserStatus] = mapped_column(SAEnum(UserStatus), default=UserStatus.ACTIVE, index=True)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    delivery_radius: Mapped[float] = mapped_column(Float, default=50.0)
    estimated_arrival_minutes: Mapped[int] = mapped_column(Integer, default=60)
    commission_rate: Mapped[float] = mapped_column(Float, default=0.1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship('User', backref='owned_shops')
    tailors = relationship('TailorProfile', back_populates='shop')
    staff = relationship('ShopStaff', back_populates='shop', cascade='all, delete-orphan')
    services = relationship('ShopService', back_populates='shop', cascade='all, delete-orphan')
    vehicles = relationship('ShopVehicle', back_populates='shop', cascade='all, delete-orphan')
    service_requests = relationship('ServiceRequest', back_populates='shop')
    orders = relationship('Order', back_populates='shop')


class ShopStaff(Base):
    __tablename__ = 'shop_staff'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id', ondelete='CASCADE'), index=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), index=True)
    role: Mapped[str] = mapped_column(String(50))
    permissions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    salary: Mapped[float | None] = mapped_column(Float, nullable=True)
    commission_rate: Mapped[float] = mapped_column(Float, default=0)
    shift_start: Mapped[str | None] = mapped_column(String(10), nullable=True)
    shift_end: Mapped[str | None] = mapped_column(String(10), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    shop = relationship('TailorShop', back_populates='staff')
    user = relationship('User', back_populates='shop_staff')
    schedules = relationship('StaffSchedule', back_populates='staff', cascade='all, delete-orphan')


class StaffSchedule(Base):
    __tablename__ = 'staff_schedules'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('shop_staff.id', ondelete='CASCADE'), index=True)
    day_of_week: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[str] = mapped_column(String(10))
    end_time: Mapped[str] = mapped_column(String(10))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    staff = relationship('ShopStaff', back_populates='schedules')


class ShopService(Base):
    __tablename__ = 'shop_services'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id', ondelete='CASCADE'), index=True)
    service_type: Mapped[ServiceType] = mapped_column(SAEnum(ServiceType), index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    shop = relationship('TailorShop', back_populates='services')


class ShopVehicle(Base):
    __tablename__ = 'shop_vehicles'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('tailor_shops.id', ondelete='CASCADE'), index=True)
    plate_number: Mapped[str] = mapped_column(String(20))
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    driver_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    driver_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    shop = relationship('TailorShop', back_populates='vehicles')
