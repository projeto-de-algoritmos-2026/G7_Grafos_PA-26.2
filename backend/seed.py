import asyncio
from app.database import db as prisma

async def seed():
    await prisma.connect()
    print("Database connected.")

    print("Limpiando produtos antigos...")
    await prisma.productimage.delete_many()
    await prisma.product.delete_many()

    produtos = [
        {
            "name": "Tênis Esportivo Nike Zoom",
            "price": 499.90,
            "stock": 25,
            "rating": 4.8,
            "images": [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
            ]
        },
        {
            "name": "Headphone Sony WH-1000XM4",
            "price": 1899.00,
            "stock": 10,
            "rating": 4.9,
            "images": [
                "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80"
            ]
        },
        {
            "name": "Câmera Canon EOS Rebel T7",
            "price": 2899.99,
            "stock": 5,
            "rating": 4.7,
            "images": [
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"
            ]
        },
        {
            "name": "Relógio Smartwatch Apple Series 8",
            "price": 3299.00,
            "stock": 15,
            "rating": 4.9,
            "images": [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
            ]
        },
        {
            "name": "Teclado Mecânico Keychron K2",
            "price": 650.00,
            "stock": 30,
            "rating": 4.6,
            "images": [
                "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"
            ]
        },
        {
            "name": "Mochila Dell Pro Slim 15",
            "price": 249.90,
            "stock": 50,
            "rating": 4.5,
            "images": [
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
            ]
        },
        {
            "name": "Cadeira Gamer ThunderX3",
            "price": 1250.00,
            "stock": 8,
            "rating": 4.4,
            "images": [
                "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80"
            ]
        }
    ]

    for p in produtos:
        print(f"Inserindo produto: {p['name']}")
        novo_produto = await prisma.product.create(
            data={
                "name": p["name"],
                "price": p["price"],
                "stock": p["stock"],
                "rating": p["rating"]
            }
        )

        for i, img_url in enumerate(p["images"]):
            await prisma.productimage.create(
                data={
                    "productId": novo_produto.id,
                    "imageUrl": img_url,
                    "order": i
                }
            )

    print("Seeding concluído com sucesso!")
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(seed())
