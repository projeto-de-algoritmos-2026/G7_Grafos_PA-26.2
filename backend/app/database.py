import logging
from app.config import SUPABASE_URL, SUPABASE_KEY, DATABASE_URL
from app.generated.prisma import Prisma
from supabase import create_client, Client

logger = logging.getLogger("uvicorn")


db = Prisma(auto_register=True)


_supabase_client: Client | None = None

def get_prisma_client() -> Prisma:
    """Retorna a instância do cliente Prisma."""
    return db

def get_supabase_client() -> Client:
    """Retorna a instância do cliente Supabase REST."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

async def connect_db():
    """Conecta ao banco de dados PostgreSQL do Supabase via Prisma."""
    if not DATABASE_URL or "your-project-ref" in DATABASE_URL:
        logger.warning(
            "⚠️ [Prisma] DATABASE_URL não configurada no backend/.env. Executando em modo de demonstração."
        )
        return

    try:
        if not db.is_connected():
            await db.connect()
            logger.info("✅ [Prisma] Conectado ao banco de dados Supabase PostgreSQL com sucesso!")
    except Exception as e:
        logger.error(f"❌ [Prisma] Erro ao conectar ao banco de dados: {e}")

async def disconnect_db():
    """Desconecta do banco de dados ao encerrar o servidor."""
    if db.is_connected():
        await db.disconnect()
        logger.info("🔌 [Prisma] Desconectado do banco de dados.")