from fastapi import APIRouter
from app.database import db as prisma
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/api",
    tags=["Orders and Checkout"]
)

class OrderItemInput(BaseModel):
    id: int
    quantity: int

class CheckoutPayload(BaseModel):
    items: List[OrderItemInput]
    cep: str
    user_id: str | None = None

@router.post("/checkout")
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
            
        order = await prisma.order.create(
        data={
            "userId": payload.user_id,
            "cep": payload.cep,
            "totalPrice": total_price,
            "items": {
                "create": valid_items
            }
        },
        include={
            "items": True
        }
    )
    
    return {"message": "Compra simulada com sucesso", "order_id": order.id}

@router.get("/orders")
async def list_orders():
    """
    Lista todos os pedidos registrados.
    """
    orders = await prisma.order.find_many(
        include={
            "items": {
                "include": {
                    "product": True
                }
            }
        },
        order={"createdAt": "desc"}
    )
    return orders

@router.get("/orders/{order_id}")
async def get_order(order_id: int):
    """
    Busca um pedido específico pelo ID.
    """
    order = await prisma.order.find_unique(
        where={
            "id": order_id
        },
        include={
            "items": {
                "include": {
                    "product": True
                }
            }
        }
    )
    return order
