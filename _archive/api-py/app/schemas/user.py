from pydantic import BaseModel, Field
from typing import Optional


class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    avatar: Optional[str] = None


class AddressRequest(BaseModel):
    label: Optional[str] = None
    street: str
    district: Optional[str] = None
    city: str
    region: Optional[str] = None
    country: Optional[str] = 'SA'
    building_number: Optional[str] = None
    apartment_number: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_default: bool = False


class MeasurementRequest(BaseModel):
    name: str
    data: dict
