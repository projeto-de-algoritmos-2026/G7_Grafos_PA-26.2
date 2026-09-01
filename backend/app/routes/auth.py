from fastapi import APIRouter, status
from app.schemas.user import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo usuário",
    description="Cria uma nova conta de usuário no Supabase com nome completo, email e senha."
)
async def register(payload: UserRegisterRequest) -> AuthResponse:
    return await AuthService.register(payload)


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Login de usuário",
    description="Autentica um usuário existente com email e senha no Supabase."
)
async def login(payload: UserLoginRequest) -> AuthResponse:
    return await AuthService.login(payload)


@router.get(
    "/health",
    summary="Verificar integridade do backend",
    description="Retorna o status do servidor e da configuração do Prisma com Supabase."
)
async def health_check():
    configured = AuthService._is_configured()
    return {
        "status": "online",
        "orm": "Prisma Client Python",
        "database": "Supabase PostgreSQL",
        "database_configured": configured,
        "mode": "production" if configured else "demo_mock"
    }