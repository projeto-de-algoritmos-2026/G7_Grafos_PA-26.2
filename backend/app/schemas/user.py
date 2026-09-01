from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Dict, Any

class UserRegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    confirmPassword: str

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("O nome completo deve ter pelo menos 2 caracteres.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("A senha deve conter no mínimo 6 caracteres.")
        return v

    @field_validator("confirmPassword")
    @classmethod
    def validate_passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("As senhas não coincidem.")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserData(BaseModel):
    id: str
    email: str
    fullName: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserData] = None
    access_token: Optional[str] = None