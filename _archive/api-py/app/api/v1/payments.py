from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response
from app.models.payment import PaymentTransaction, Invoice, ProviderInvoice
from app.models.user import User
from app.models.enums import UserRole, PaymentMethod, PaymentStatus
from app.config import settings

router = APIRouter(prefix='/payments', tags=['Payments'])


@router.post('/process')
async def process_payment(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Placeholder payment processing
    tx = PaymentTransaction(
        order_id=data['order_id'],
        amount=data['amount'],
        method=PaymentMethod(data['method']),
        status=PaymentStatus.PAID,
        gateway_reference=f'TXN-{current_user.id[:8].upper()}',
    )
    db.add(tx)
    await db.commit()
    return success_response({'transaction': {'id': tx.id, 'status': tx.status.value}}, 'Payment processed')


@router.get('/transactions/{order_id}')
async def get_transactions(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(PaymentTransaction).where(PaymentTransaction.order_id == order_id))
    txs = result.scalars().all()
    return success_response({
        'transactions': [{'id': t.id, 'amount': t.amount, 'method': t.method.value, 'status': t.status.value, 'createdAt': t.created_at.isoformat()} for t in txs]
    })


@router.post('/invoice/generate/{order_id}')
async def generate_invoice(order_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.TAILOR_SHOP.value))):
    import uuid as uuid_lib
    from datetime import datetime, timezone
    invoice = Invoice(
        order_id=order_id,
        invoice_number=f'INV-{datetime.now(timezone.utc).strftime("%Y%m%d")}-{uuid_lib.uuid4().hex[:6].upper()}',
        uuid=str(uuid_lib.uuid4()),
        total_amount=0, vat_amount=0, grand_total=0,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return success_response({'invoice': {'id': invoice.id, 'invoiceNumber': invoice.invoice_number}}, 'Invoice generated')
