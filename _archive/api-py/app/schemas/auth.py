from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r'^(\+966|0)?5\d{8}$')
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = 'CUSTOMER'

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        allowed = ['CUSTOMER', 'TAILOR', 'TAILOR_SHOP', 'MERCHANT']
        if v and v.upper() not in allowed:
            raise ValueError(f'Role must be one of: {allowed}')
        return v.upper() if v else 'CUSTOMER'


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=5)
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyPhoneRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    phone: str = Field(..., min_length=5)


class ResetPasswordRequest(BaseModel):
    phone: str = Field(..., min_length=5)
    code: str = Field(..., min_length=6, max_length=6)
    password: str = Field(..., min_length=6, max_length=100)


class AuthResponse(BaseModel):
    user: dict
    access_token: str
    refresh_token: str
    expires_in: int


class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    status: str
    avatar: Optional[str] = None
    phone_verified: bool
    created_at: str
