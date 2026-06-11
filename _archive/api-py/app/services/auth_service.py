from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.user import User
from app.models.enums import UserRole, UserStatus
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.config import settings


class AuthService:

    @staticmethod
    async def register(db: AsyncSession, name: str, phone: str, password: str, email: str | None = None, role: str = 'CUSTOMER') -> dict:
        existing = await db.execute(select(User).where(or_(User.phone == phone, User.email == email if email else None)))
        if existing.scalar_one_or_none():
            raise ValueError('Phone or email already registered')

        user = User(
            name=name,
            phone=phone,
            email=email,
            password=hash_password(password),
            role=UserRole(role),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        return AuthService._generate_auth_response(user)

    @staticmethod
    async def login(db: AsyncSession, phone: str, password: str) -> dict:
        # Support both formats: 5xxxxxxxx and +9665xxxxxxxx
        phone_clean = phone.replace('+966', '').replace('966', '')
        if not phone_clean.startswith('5'):
            phone_clean = '5' + phone_clean.lstrip('0')

        result = await db.execute(
            select(User).where(
                or_(User.phone == f'+966{phone_clean}', User.phone == phone_clean, User.phone == phone)
            )
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.password):
            raise ValueError('Invalid phone or password')

        if user.status != UserStatus.ACTIVE:
            raise ValueError('Account is not active')

        return AuthService._generate_auth_response(user)

    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get('type') != 'refresh':
            raise ValueError('Invalid refresh token')

        user_id = payload.get('sub')
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError('User not found')

        return AuthService._generate_auth_response(user)

    @staticmethod
    async def get_profile(db: AsyncSession, user_id: str) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    def _generate_auth_response(user: User) -> dict:
        token_data = {'sub': user.id, 'role': user.role.value}
        access_token = create_access_token(token_data, timedelta(minutes=settings.access_token_expire_minutes))
        refresh_token = create_refresh_token(token_data)

        return {
            'user': {
                'id': user.id,
                'name': user.name,
                'phone': user.phone,
                'email': user.email,
                'role': user.role.value,
                'status': user.status.value,
                'avatar': user.avatar,
                'phoneVerified': user.phone_verified,
                'createdAt': user.created_at.isoformat(),
            },
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': settings.access_token_expire_minutes * 60,
        }
