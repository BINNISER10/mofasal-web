from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.api.deps import get_current_user, authorize
from app.utils.response import success_response, paginated_response
from app.models.user import User, UserStatus
from app.models.shop import TailorShop
from app.models.order import Order
from app.models.system import SystemConfig, SystemModule, AuditLog
from app.models.enums import UserRole
from typing import Optional

router = APIRouter(prefix='/admin', tags=['Admin'])


@router.get('/dashboard', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_shops = (await db.execute(select(func.count(TailorShop.id)))).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Order.grand_total), 0)))).scalar() or 0
    recent_orders_result = await db.execute(select(Order).options(selectinload(Order.customer), selectinload(Order.shop)).order_by(Order.created_at.desc()).limit(5))
    recent_orders = recent_orders_result.scalars().all()
    recent_users_result = await db.execute(select(User).order_by(User.created_at.desc()).limit(5))
    recent_users = recent_users_result.scalars().all()

    return success_response({
        'dashboard': {
            'totalUsers': total_users,
            'totalShops': total_shops,
            'totalMerchants': 0,
            'totalOrders': total_orders,
            'totalRevenue': float(total_revenue),
            'recentOrders': [{'id': o.order_number, 'customerName': o.customer.name, 'shopName': o.shop.name, 'status': o.status.value, 'amount': o.grand_total} for o in recent_orders],
            'recentUsers': [{'name': u.name, 'role': u.role.value, 'status': u.status.value, 'createdAt': u.created_at.isoformat()} for u in recent_users],
            'revenueByMonth': [],
            'ordersByStatus': [],
        }
    })


@router.get('/users', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_admin_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias='status'),
):
    query = select(User).options(selectinload(User.orders_as_customer))
    if role:
        query = query.where(User.role == role)
    if status_filter:
        query = query.where(User.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    users = result.scalars().all()

    return paginated_response(
        [{'id': u.id, 'name': u.name, 'phone': u.phone, 'email': u.email, 'role': u.role.value, 'status': u.status.value, 'createdAt': u.created_at.isoformat(), 'ordersCount': len(u.orders_as_customer)} for u in users],
        total, page, limit,
    )


@router.put('/users/{user_id}/status', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def update_user_status(user_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user.status = UserStatus(data['status'])
    await db.commit()
    return success_response({'user': {'id': user.id, 'status': user.status.value}}, 'Status updated')


@router.get('/config', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_configs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SystemConfig).where(SystemConfig.is_active == True))
    configs = result.scalars().all()
    return success_response({
        'configs': [{'key': c.key, 'value': c.value, 'type': c.type, 'category': c.category, 'label': c.label, 'labelAr': c.label_ar, 'description': c.description, 'descriptionAr': c.description_ar, 'isEnabled': c.is_active} for c in configs]
    })


@router.get('/modules', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_modules(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SystemModule).order_by(SystemModule.order))
    modules = result.scalars().all()
    return success_response({
        'modules': [{'key': m.key, 'name': m.name, 'nameAr': m.name_ar, 'description': m.description, 'descriptionAr': m.description_ar, 'isEnabled': m.is_enabled, 'parentModuleKey': m.parent_module_key, 'order': m.order} for m in modules]
    })


@router.get('/audit-logs', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    result = await db.execute(select(AuditLog).options(selectinload(AuditLog.user)).order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit))
    logs = result.scalars().all()
    total = (await db.execute(select(func.count(AuditLog.id)))).scalar() or 0
    return paginated_response(
        [{'id': l.id, 'action': l.action, 'user': l.user.name if l.user else 'System', 'role': l.user.role.value if l.user else '-', 'ip': l.ip_address, 'details': f'{l.action} on {l.entity}', 'timestamp': l.created_at.isoformat(), 'severity': 'info'} for l in logs],
        total, page, limit,
    )


@router.get('/reports/orders', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_order_reports(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response({'reports': []})


@router.get('/reports/revenue', dependencies=[Depends(authorize(UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value))])
async def get_revenue_reports(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return success_response({'reports': []})
