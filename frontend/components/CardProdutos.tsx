'use client';
import React from "react";

type Produto = {
    id: number;
    name: string;
    price: number;
    stock: number;
    product_images?: { id: number; image_url: string; order: number }[];
};

type ProdutoCardProps = {
    produto: Produto;
}

export default function CardProdutos({ produto }: ProdutoCardProps) {
    return (
        <div
            key={produto.id}
            className="relative w-[170px] bg-[#ffffff] shadow rounded-4xl p-4 h-55 flex flex-col justify-between text-black transition-transform cursor-pointer shrink-0"
        >
            <div className="flex justify-center items-center flex-1 overflow-hidden">
                <img
                    src={produto.product_images?.[0]?.image_url}
                    alt={produto.name}
                    className="h-24 object-contain"
                />
            </div>

            <div className="flex flex-col text-text items-start w-full">

                <h4 className="text-lg font-semibold w-full truncate" title={produto.name}>
                    {produto.name}
                </h4>

                <p className="font-semibold">R${produto.price}</p>

                {produto.stock > 0 ? (
                    <p className="text-green-600 font-bold text-sm">Disponível</p>
                ) : (
                    <p className="text-red-600 font-bold text-sm">Indisponível</p>
                )}
            </div>
        </div>
    )
}