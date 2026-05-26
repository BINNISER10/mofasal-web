import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Enum as SAEnum
from app.database import Base
from app.models.enums import InventoryMovementType


class Category(Base):
    __tablename__ = 'categories'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200))
    name_ar: Mapped[str | None] = mapped_column(String(200), nullable=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('categories.id'), nullable=True, index=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent = relationship('Category', backref='children', remote_side='Category.id')
    products = relationship('Product', back_populates='category')


class Product(Base):
    __tablename__ = 'products'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    name_ar: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('categories.id'), nullable=True)
    price: Mapped[float] = mapped_column(Float)
    compare_at_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    cost_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit: Mapped[str] = mapped_column(String(50), default='piece')
    images: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    visibility: Mapped[str] = mapped_column(String(20), default='PUBLIC')
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)
    attributes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship('Category', back_populates='products')
    variants = relationship('ProductVariant', back_populates='product', cascade='all, delete-orphan')
    inventory_movements = relationship('InventoryMovement', back_populates='product', cascade='all, delete-orphan')
    cart_items = relationship('CartItem', back_populates='product')


class ProductVariant(Base):
    __tablename__ = 'product_variants'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('products.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(String(100))
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    sku: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    product = relationship('Product', back_populates='variants')


class InventoryMovement(Base):
    __tablename__ = 'inventory_movements'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('products.id', ondelete='CASCADE'), index=True)
    movement_type: Mapped[InventoryMovementType] = mapped_column('type', SAEnum(InventoryMovementType))
    quantity: Mapped[int] = mapped_column(Integer)
    reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product = relationship('Product', back_populates='inventory_movements')


class Cart(Base):
    __tablename__ = 'carts'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    order_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship('User', back_populates='cart')
    items = relationship('CartItem', back_populates='cart', cascade='all, delete-orphan')
    order = relationship('Order', backref='cart_ref')


class CartItem(Base):
    __tablename__ = 'cart_items'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    cart_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('carts.id', ondelete='CASCADE'), index=True)
    product_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('products.id'))
    variant_id: Mapped[str | None] = mapped_column(nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('users.id'), index=True)

    cart = relationship('Cart', back_populates='items')
    product = relationship('Product', back_populates='cart_items')
    user = relationship('User', back_populates='cart_items')
