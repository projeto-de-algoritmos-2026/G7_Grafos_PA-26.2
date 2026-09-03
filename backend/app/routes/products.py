from fastapi import APIRouter
from app.database import db as prisma

router = APIRouter(
    prefix="/api/products",
    tags=["Produtos"]
)

@router.get("/")
async def get_all_products():
    """
    Retorna todos os produtos cadastrados com suas respectivas imagens.
    """
    products = await prisma.product.find_many(
        include={
            "images": {
                "order_by": {
                    "order": "asc"
                }
            }
        }
    )
    
    # Format to match frontend Products type
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock,
            "rating": p.rating,
            "created_at": p.createdAt.isoformat() if p.createdAt else None,
            "product_images": [
                {
                    "id": img.id,
                    "image_url": img.imageUrl,
                    "order": img.order
                }
                for img in p.images
            ] if p.images else []
        })
    
    return result

@router.get("/{product_id}")
async def get_product_by_id(product_id: int):
    """
    Retorna um produto específico pelo ID.
    """
    p = await prisma.product.find_unique(
        where={
            "id": product_id
        },
        include={
            "images": {
                "order_by": {
                    "order": "asc"
                }
            }
        }
    )
    
    if not p:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    return {
        "id": p.id,
        "name": p.name,
        "price": p.price,
        "stock": p.stock,
        "rating": p.rating,
        "created_at": p.createdAt.isoformat() if p.createdAt else None,
        "product_images": [
            {
                "id": img.id,
                "image_url": img.imageUrl,
                "order": img.order
            }
            for img in p.images
        ] if p.images else []
    }
