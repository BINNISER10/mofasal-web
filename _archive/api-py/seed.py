#!/usr/bin/env python3
"""MUFASAL seed script — creates sample users."""

import asyncio, httpx, logging
from sqlalchemy import select
from app.database import async_session
from app.models.user import User
from app.models.enums import UserRole, UserStatus
from app.utils.security import hash_password

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('seed')

SEED_USERS = [
    {'name': 'عبدالله المدير',   'phone': '+966500000001', 'password': 'Admin@123', 'role': 'ADMIN',    'email': 'admin@mufasal.com'},
    {'name': 'خالد الخياط',     'phone': '+966500000002', 'password': 'Tailor@123', 'role': 'TAILOR',   'email': 'tailor@mufasal.com'},
    {'name': 'متجر الأقمشة',     'phone': '+966500000003', 'password': 'Merc@123',   'role': 'MERCHANT', 'email': 'merchant@mufasal.com'},
    {'name': 'سارة العميلة',     'phone': '+966500000004', 'password': 'Cust@123',   'role': 'CUSTOMER', 'email': 'customer@mufasal.com'},
]


async def main():
    # Create admin directly (API does not allow ADMIN role)
    async with async_session() as session:
        existing = await session.execute(select(User).where(User.phone == SEED_USERS[0]['phone']))
        if existing.scalar_one_or_none():
            log.info('Admin already exists, skipping')
        else:
            u = SEED_USERS[0]
            user = User(name=u['name'], phone=u['phone'], email=u['email'],
                        password=hash_password(u['password']), role=UserRole.ADMIN, status=UserStatus.ACTIVE)
            session.add(user)
            await session.commit()
            log.info('✓ Admin: %s', u['name'])

    # Register other users via API
    async with httpx.AsyncClient(timeout=15) as client:
        for u in SEED_USERS[1:]:
            r = await client.post('http://localhost:4001/api/v1/auth/register', json={
                'name': u['name'], 'phone': u['phone'], 'password': u['password'],
                'email': u['email'], 'role': u['role'],
            })
            if r.status_code in (200, 201):
                log.info('✓ %s: %s', u['role'], u['name'])
            else:
                log.warning('✗ %s: %s — %s', u['role'], u['name'], r.json().get('detail', r.text))

    log.info('\nSeed complete! Login credentials:')
    for u in SEED_USERS:
        log.info('  %-10s → %s / %s', u['role'], u['phone'], u['password'])


if __name__ == '__main__':
    asyncio.run(main())
