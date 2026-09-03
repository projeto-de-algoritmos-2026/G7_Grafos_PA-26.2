from fastapi import APIRouter
from app.database import db as prisma
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/api/checkout",
    tags=["Checkout"]
)

class OrderItemInput(BaseModel):
    id: int
    quantity: int

class CheckoutPayload(BaseModel):
    items: List[OrderItemInput]
    cep: str
    user_id: str | None = None

@router.post("")
async def process_checkout(payload: CheckoutPayload):
    """
    Processa a finalização de uma compra simulada.
    """
    total_price = 0
    valid_items = []
    
    # Valida e calcula o preco
    for item in payload.items:
        product = await prisma.product.find_unique(where={"id": item.id})
        if product:
            total_price += product.price * item.quantity
            valid_items.append({
                "productId": product.id,
                "quantity": item.quantity,
                "price": product.price
            })
            
    # Cria o pedido e os itens vinculados
    order = await prisma.order.create(
        data={
            "userId": payload.user_id,
            "cep": payload.cep,
            "totalPrice": total_price,
            "status": "SIMULATED",
            "items": {
                "create": valid_items
            }
        },
        include={
            "items": True
        }
    )
    
    return {"message": "Compra simulada com sucesso", "order_id": order.id}
