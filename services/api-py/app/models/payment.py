import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.enums import PaymentMethod, PaymentStatus


class PaymentTransaction(Base):
    __tablename__ = 'payment_transactions'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    amount: Mapped[float] = mapped_column(Float)
    fee: Mapped[float] = mapped_column(Float, default=0)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod))
    status: Mapped[PaymentStatus] = mapped_column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING)
    gateway_reference: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    gateway_response: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship('Order', back_populates='payment_transactions')


class Invoice(Base):
    __tablename__ = 'invoices'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('orders.id', ondelete='CASCADE'), index=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    uuid: Mapped[str] = mapped_column(String(100), unique=True)
    total_amount: Mapped[float] = mapped_column(Float)
    vat_amount: Mapped[float] = mapped_column(Float)
    grand_total: Mapped[float] = mapped_column(Float)
    qr_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    zatca_status: Mapped[str] = mapped_column(String(20), default='DRAFT', index=True)
    zatca_uuid: Mapped[str | None] = mapped_column(String(100), nullable=True)
    zatca_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    xml_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    signed_xml: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship('Order', back_populates='invoices')
    provider_invoices = relationship('ProviderInvoice', back_populates='invoice', cascade='all, delete-orphan')


class ProviderInvoice(Base):
    __tablename__ = 'provider_invoices'

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey('invoices.id', ondelete='CASCADE'), index=True)
    provider: Mapped[str] = mapped_column(String(50))
    provider_invoice_id: Mapped[str] = mapped_column(String(255), index=True)
    status: Mapped[str] = mapped_column(String(20), default='PENDING')

    invoice = relationship('Invoice', back_populates='provider_invoices')
