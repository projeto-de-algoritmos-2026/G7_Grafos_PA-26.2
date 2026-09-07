from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS
from app.database import connect_db, disconnect_db
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.products import router as products_router
from app.routes.orders import router as orders_router
from app.routes.algoritmos import router as algoritmos_router

@asynccontextmanager
async def lifespan(app: FastAPI):

    await connect_db()
    yield

    await disconnect_db()

app = FastAPI(
    title="STOCK.IO API",
    description="API de autenticação e gestão de estoque do STOCK.IO integrada ao Supabase com Prisma ORM.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


origins = set(ALLOWED_ORIGINS + [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(algoritmos_router)

@app.get("/", tags=["Geral"])
async def root():
    return {
        "app": "STOCK.IO API",
        "orm": "Prisma Client Python",
        "database": "Supabase PostgreSQL",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)