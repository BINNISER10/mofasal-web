from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response
from app.models.payment import Invoice
from app.models.user import User
from app.models.enums import UserRole

router = APIRouter(prefix='/zatca', tags=['ZATCA'])


@router.post('/generate-invoice/{invoice_id}')
async def generate_zatca_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(authorize(UserRole.ADMIN.value, UserRole.TAILOR_SHOP.value))):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return success_response({'invoice': {'id': invoice.id, 'zatcaStatus': 'REPORTED'}}, 'ZATCA invoice generated')


@router.get('/compliance-status')
async def get_compliance_status(current_user: User = Depends(authorize(UserRole.ADMIN.value, UserRole.TAILOR_SHOP.value))):
    return success_response({
        'status': 'COMPLIANT',
        'environment': 'simulation',
        'lastChecked': '2024-01-01T00:00:00Z',
    })
