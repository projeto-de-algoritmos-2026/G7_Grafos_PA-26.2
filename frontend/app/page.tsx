'use client'
import Image from "next/image";
import { getAllProducts } from "@/api/api";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import CardProdutos from "@/components/CardProdutos";
import Link from "next/link";

import { Products } from "./Types";

import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Home() {
  const [products, setProducts] = useState<Products[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const allProducts = await getAllProducts();
      setProducts(allProducts || []);
    }
    loadData();
  }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(term));

    const combined = [
      ...filteredProducts.map((p) => ({ type: "Produto", item: p }))
    ];

    setSearchResults(combined);
    setShowResults(true);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-[#000000] w-full overflow-hidden relative h-[50vh]">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-col-reverse md:flex-row justify-center items-center gap-6 md:gap-12 relative z-10">

          <div className="text-white font-sans font-extrabold text-2xl md:text-4xl tracking-wide text-center md:text-right max-w-xl leading-tight">
            <h1>Encontre o que precisa, em alguns cliques!</h1>
          </div>

          <div className="flex-shrink-0 relative mt-4 md:mt-0">
            <Image
              src="/Home.svg"
              alt="STOKKERS Hero"
              width={600}
              height={400}
              className="object-cover drop-shadow-lg scale-100 md:scale-65 translate-y-12 md:translate-y-35"
              priority
            />
          </div>
        </div>
      </div>

      <div className="bg-white flex-1">
        <div className="max-w-7xl mx-auto px-6 pb-20">

          <div className="flex justify-end w-full mb-10 mt-10 relative">
            <div className="w-full max-w-lg relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#000000] transition-colors" />

              <input
                type="text"
                placeholder="O que você procura hoje?"
                value={searchTerm}
                onChange={handleSearchInput}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="
                  w-full
                  bg-white
                  border border-transparent
                  rounded-full
                  py-4 pl-12 pr-6
                  text-sm md:text-base
                  shadow-md
                  hover:shadow-lg
                  focus:shadow-xl
                  focus:border-[#000000]
                  outline-none
                  transition-all duration-300
                  text-[#000000]
                  placeholder-gray-400
                "
              />

              {showResults && searchResults.length > 0 && (
                <div className="absolute w-full bg-white border border-transparent rounded-2xl shadow-xl mt-2 max-h-80 overflow-y-auto z-50 custom-scrollbar">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      href={
                        result.type === "Produto"
                          ? `/product/${result.item.id}`
                          : `/store/${result.item.id}`
                      }
                      onClick={() => setShowResults(false)}
                    >
                      <div className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition border-b border-gray-200 last:border-none">
                        <p className="text-xs text-[#000000] font-bold uppercase tracking-wider mb-1">{result.type}</p>
                        <p className="text-gray-800 text-sm font-medium">{result.item.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>



          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
              <h2 className="text-[#000000] font-sans font-bold text-xl md:text-4xl">
                Todos os Produtos
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.length > 0 ? (
                products.map((produto) => (
                  <Link key={produto.id} href={`/product/${produto.id}`} className="block h-full">
                    <CardProdutos key={produto.id} produto={produto} />
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 font-medium col-span-full text-center py-10">Nenhum produto encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}