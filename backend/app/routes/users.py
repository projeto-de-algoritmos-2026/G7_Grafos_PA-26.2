from fastapi import APIRouter, HTTPException, status
from app.database import db

router = APIRouter(prefix="/api/users", tags=["Usuários"])

@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    if not db.is_connected():
        return {"id": user_id, "email": "demo@stock.io", "fullName": "Usuário Demonstração"}
    
    try:
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return {
            "id": str(user.id),
            "email": user.email,
            "fullName": user.fullName
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
