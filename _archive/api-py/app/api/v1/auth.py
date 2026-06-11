from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyPhoneRequest
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.utils.response import success_response, created_response, error_response
from app.models.user import User

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.post('/register')
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await AuthService.register(db, req.name, req.phone, req.password, req.email, req.role)
        return created_response(result, 'Account created successfully')
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post('/login')
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await AuthService.login(db, req.phone, req.password)
        return success_response(result, 'Login successful')
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post('/refresh-token')
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await AuthService.refresh_token(db, req.refresh_token)
        return success_response(result, 'Token refreshed')
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get('/profile')
async def get_profile(current_user: User = Depends(get_current_user)):
    return success_response({
        'id': current_user.id,
        'name': current_user.name,
        'phone': current_user.phone,
        'email': current_user.email,
        'role': current_user.role.value,
        'status': current_user.status.value,
        'avatar': current_user.avatar,
        'phone_verified': current_user.phone_verified,
        'createdAt': current_user.created_at.isoformat(),
    })


@router.put('/profile')
async def update_profile(data: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    allowed = {'name', 'email', 'avatar'}
    for key, value in data.items():
        if key in allowed and value is not None:
            setattr(current_user, key, value)
    await db.commit()
    return success_response({'id': current_user.id, 'name': current_user.name, 'email': current_user.email}, 'Profile updated')


@router.post('/verify-phone')
async def verify_phone(req: VerifyPhoneRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.phone_verified = True
    await db.commit()
    return success_response(None, 'Phone verified')


@router.post('/send-verification')
async def send_verification(current_user: User = Depends(get_current_user)):
    return success_response(None, 'Verification code sent')


@router.post('/forgot-password')
async def forgot_password(req: ForgotPasswordRequest):
    return success_response(None, 'If the phone exists, a reset code has been sent')


@router.post('/reset-password')
async def reset_password(req: ResetPasswordRequest):
    return success_response(None, 'Password has been reset')
