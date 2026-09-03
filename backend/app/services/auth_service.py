import bcrypt
from fastapi import HTTPException, status
from app.database import db
from app.config import DATABASE_URL
from app.schemas.user import UserRegisterRequest, UserLoginRequest, UserData, AuthResponse

class AuthService:
    @staticmethod
    def _is_configured() -> bool:
        return bool(DATABASE_URL and "your-project-ref" not in DATABASE_URL)

    @staticmethod
    def _hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def _verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    @classmethod
    async def register(cls, payload: UserRegisterRequest) -> AuthResponse:
        """
        Registra um novo usuário no banco de dados Supabase via Prisma com senha criptografada.
        """
        if not cls._is_configured() or not db.is_connected():
            return AuthResponse(
                success=True,
                message="[Modo Demonstração] Usuário cadastrado com sucesso! Configure seu DATABASE_URL no backend/.env para persistência real no Supabase com Prisma.",
                user=UserData(
                    id="mock-user-id",
                    email=str(payload.email),
                    fullName=payload.fullName,
                    role="cliente"
                )
            )

        try:

            existing_user = await db.user.find_unique(where={"email": str(payload.email)})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Este e-mail já está cadastrado no sistema."
                )


            hashed_pwd = cls._hash_password(payload.password)


            user = await db.user.create(
                data={
                    "email": str(payload.email),
                    "fullName": payload.fullName,
                    "password": hashed_pwd
                }
            )

            return AuthResponse(
                success=True,
                message="Usuário registrado com sucesso!",
                user=UserData(
                    id=str(user.id),
                    email=str(user.email),
                    fullName=str(user.fullName),
                    role=str(user.role)
                )
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao cadastrar usuário com Prisma: {str(e)}"
            )

    @classmethod
    async def login(cls, payload: UserLoginRequest) -> AuthResponse:
        """
        Autentica o usuário verificando o hash da senha no banco de dados via Prisma.
        """
        if not cls._is_configured() or not db.is_connected():
            return AuthResponse(
                success=True,
                message="[Modo Demonstração] Login efetuado com sucesso!",
                user=UserData(
                    id="mock-user-id",
                    email=str(payload.email),
                    fullName="Usuário Demonstração",
                    role="cliente"
                ),
                access_token="mock-token-xyz"
            )

        try:
            user = await db.user.find_unique(where={"email": str(payload.email)})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="E-mail ou senha incorretos."
                )

            if not cls._verify_password(payload.password, user.password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="E-mail ou senha incorretos."
                )

            return AuthResponse(
                success=True,
                message="Login realizado com sucesso!",
                user=UserData(
                    id=str(user.id),
                    email=str(user.email),
                    fullName=str(user.fullName),
                    role=str(user.role)
                ),
                access_token=f"prisma-token-{user.id}"
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro de autenticação: {str(e)}"
            )