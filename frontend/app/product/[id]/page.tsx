'use client';

import Link from 'next/link';
import { getProductsById } from "@/api/api";
import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ZoomableImage from "@/components/ZoomableImage";
import { useCart } from '@/context/Carrinho';


interface Products {
    id: number,
    name: string,
    description?: string,
    price: number,
    stock: number,
    category: { name: string },
    product_images: { order: number, image_url: string }[],
}

interface User {
    username: string;
    profile_picture_url?: string;
}

interface ProductImage {
    id?: number;
    order: number;
    image_url: string;
}

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    product_images: ProductImage[];
}

const CartIconPlus = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product | null | undefined>(undefined);
    const [mean, setMean] = useState(0);
    const [image_number, setImage] = useState(0);
    const [isOwner, setOwner] = useState(false);

    async function fetchProduct() {
        try {
            const product = await getProductsById(Number(id));

            setProducts(product);
        } catch (err) { console.log(err) }
    }

    useEffect(() => {
        if (!id) return;
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!products) return;

        addToCart({
            id: products.id,
            name: products.name,
            price: products.price,
            quantity: 1
        });
    };

    if (products === undefined) return <div className="min-h-screen bg-back flex items-center justify-center"><p className="text-laranja font-bold">Carregando...</p></div>;
    if (products === null) return <div className="min-h-screen bg-back flex items-center justify-center"><p className="text-red-500 font-bold">Produto não encontrado.</p></div>;

    return (
        <main className="min-h-screen bg-back pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 max-w-7xl">

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-back text-text mb-16">

                    <div className="flex flex-row w-full lg:w-3/5 h-[500px] gap-4">
                        <div className="flex flex-col gap-4 h-full w-24 shrink-0">
                            <div className="flex flex-col gap-4 overflow-y-auto h-full scrollbar-hide">
                                {products?.product_images?.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`bg-card rounded-2xl overflow-hidden hover:brightness-90 hover:cursor-pointer transition w-full aspect-square shrink-0 snap-start border-2 ${image_number === index ? 'border-laranja' : 'border-transparent'}`}
                                        onClick={() => setImage(index)}
                                    >
                                        <img
                                            src={item?.image_url}
                                            alt={`Thumbnail ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex-1 h-full bg-card rounded-3xl overflow-hidden shadow-sm">
                            <ZoomableImage
                                src={products?.product_images?.[image_number]?.image_url}
                                alt={products.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-2/5 py-2">

                        <div className="flex justify-between items-start gap-4">
                            <h1 className="font-sans font-bold capitalize text-4xl leading-tight text-text">
                                {products?.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base border-b border-gray-200 pb-4">
                            <div className="font-medium text-gray-500">
                                {products?.stock} disponíveis
                            </div>
                        </div>

                        <div>
                            <span className="font-sans font-bold text-5xl text-text">
                                R$ {products?.price}
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-black cursor-pointer text-white font-bold py-4 rounded-2xl hover:brightness-90 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                            >
                                <CartIconPlus />
                                <span>Adicionar ao Carrinho</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="font-sans text-lg font-bold mb-2">Descrição</h3>
                            <p className="font-sans text-gray-600 leading-relaxed text-justify">
                                {products?.description || "Sem descrição disponível."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}