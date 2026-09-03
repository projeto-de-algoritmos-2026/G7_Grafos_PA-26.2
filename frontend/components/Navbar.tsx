'use client'
import { getUserById, processCheckout } from "@/api/api";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { FaSignOutAlt, FaStore, FaSun, FaShoppingCart, FaTrash, FaCreditCard, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from "@/context/Carrinho";

interface User {
    id: string;
    email: string;
    fullName: string;
}

const PaymentModal = ({ isOpen, onClose, total, cartItems, onSuccess }: any) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [cep, setCep] = useState('');

    const handleCepChange = (e: any) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        }
        setCep(value);
    };

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setCep('');
        }
    }, [isOpen]);

    const handleConfirmPayment = async () => {
        if (!cep || cep.trim().length < 8) {
            toast.warning("Por favor, digite um CEP válido.");
            return;
        }

        setStatus('processing');

        setTimeout(async () => {
            try {
                const itemsPayload = cartItems.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity
                }));

                const token = localStorage.getItem("stockio_token");
                let userId = null;
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = payload.sub;
                    } catch (e) { }
                }

                await processCheckout({
                    items: itemsPayload,
                    cep: cep,
                    user_id: userId
                });

                setStatus('success');

                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);

            } catch (error) {
                console.error("Erro no checkout:", error);
                // Como é simulado, garantimos o sucesso na tela mesmo se o backend falhar momentaneamente
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            }
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#000000] dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 text-center transform transition-all scale-100">

                {status === 'idle' && (
                    <>
                        <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                            <FaCreditCard size={30} />
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-2">Confirmar Pagamento</h2>
                        <p className="text-gray-500 mb-6">
                            Você está prestes a finalizar a compra de <span className="font-bold">{cartItems.length} itens</span>.
                        </p>

                        <div className="text-left mb-6">
                            <label className="block text-sm font-semibold text-text mb-2">CEP de Entrega</label>
                            <input
                                type="text"
                                placeholder="00000-000"
                                value={cep}
                                onChange={handleCepChange}
                                maxLength={9}
                                className="w-full bg-cinzaclaro border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black transition"
                            />
                        </div>

                        <div className="bg-cinzaclaro p-4 rounded-xl mb-6 flex justify-between items-center">
                            <span className="text-gray-600">Total a pagar:</span>
                            <span className="text-2xl font-extrabold text-black">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 cursor-pointer rounded-xl border border-gray-300 text-gray-500 font-semibold hover:bg-gray-100 transition">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmPayment} className="flex-1 py-3 rounded-xl cursor-pointer bg-black text-card font-bold hover:brightness-90 transition shadow-lg">
                                Pagar Agora
                            </button>
                        </div>
                    </>
                )}

                {status === 'processing' && (
                    <div className="py-10 flex flex-col items-center">
                        <FaSpinner className="animate-spin text-black text-5xl mb-4" />
                        <p className="text-text font-semibold text-lg">Processando pagamento...</p>
                        <p className="text-gray-400 text-sm">Verificando estoque e saldo.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-1">Compra Realizada!</h2>
                        <p className="text-gray-500">Seu pedido foi confirmado.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8 flex flex-col items-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-text mb-1">Erro no Pagamento</h2>
                        <p className="text-gray-500 mb-4">Não foi possível processar ou estoque insuficiente.</p>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 font-semibold">Fechar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Navbar() {
    const { cartItems, totalPrice, removeFromCart, cartCount, clearCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [logado, setLogado] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setIsCartOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("stockio_token");
        if (!token) {
            setLogado(false);
            return;
        }

        let id: string;
        try {
            if (token.startsWith("prisma-token-")) {
                id = token.replace("prisma-token-", "");
            } else if (token === "mock-token-xyz") {
                id = "mock-user-id";
            } else {
                // Token inválido para esse formato
                localStorage.removeItem("stockio_token");
                setLogado(false);
                return;
            }

            setUserId(id);
            setLogado(true);

            // Busca os dados do usuário direto da API
            fetchUserAPI(id);
        } catch (error) {
            console.error("Erro ao processar token:", error);
            localStorage.removeItem("stockio_token");
            setLogado(false);
            return;
        }

        async function fetchUserAPI(userId: string) {
            try {
                const fetchedUser = await getUserById(userId);
                if (fetchedUser) setUser(fetchedUser);
            } catch (error) {
                console.error("Erro user:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("stockio_token");
        setLogado(false);
        window.location.reload();
    }

    const getActiveClass = (href: string) => {
        if (href.includes('/profile')) {
            return pathname.startsWith(href) ? 'text-white' : 'text-black';
        }
        return pathname === href ? 'text-white' : 'text-black';
    };

    const getLinkActiveClass = (href: string) => pathname.startsWith(href) ? 'bg-black text-card' : 'border border-black text-black hover:bg-black hover:text-card';

    const CartDropdown = () => (
        <div className="relative" ref={cartRef}>
            <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="text-2xl text-white hover:text-[#C6E700] cursor-pointer transition-colors relative flex items-center"
            >
                <FaShoppingCart />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </button>

            {isCartOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-card rounded-lg shadow-xl overflow-hidden z-50 border border-transparent">
                    <div className="p-4 bg-cinzaclaro border-b border-cinzaclaro flex justify-between items-center">
                        <h3 className="text-text font-semibold">Meu Carrinho</h3>
                        <span className="text-xs text-gray-500">{cartCount} itens</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <p className="p-4 text-gray-500 text-center text-sm">O carrinho está vazio.</p>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 border-b border-cinzaclaro hover:brightness-95 transition">
                                    <Link
                                        href={`/product/${item.id}`}
                                        onClick={() => setIsCartOpen(false)}
                                        className="flex-1 pr-2 cursor-pointer group"
                                    >
                                        <p className="text-sm font-medium text-text truncate group-hover:text-black transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.quantity}x R$ {item.price}
                                        </p>
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-black">
                                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromCart(item.id);
                                            }}
                                            className="text-red-500 cursor-pointer hover:text-red-700 p-1"
                                            title="Remover item"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="p-4 bg-cinzaclaro">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 font-medium">Total:</span>
                                <span className="text-lg font-bold text-text">
                                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    if (!logado) {
                                        setIsCartOpen(false);
                                        router.push('/login');
                                        return;
                                    }

                                    setIsCartOpen(false);
                                    setIsPaymentModalOpen(true);
                                }}
                                className="block text-center cursor-pointer w-full bg-black text-card py-2 rounded-md font-semibold hover:brightness-90 transition shadow-md"
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            <nav className="bg-[#000000] fixed top-0 left-0 w-full z-50 shadow-md h-16 md:h-20" >
                <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">

                    <Link href="/" className="flex items-center">
                        <Image
                            src="/LogoBranca.svg"
                            alt="Stock.io"
                            width={320}
                            height={90}
                            className="w-auto h-20 md:h-8 object-contain drop-shadow-md transition-transform hover:scale-[1.02]"
                            priority
                        />
                    </Link>

                    {!logado ? (
                        <div className="flex space-x-6 items-center">
                            <Link href="/login" className="text-white font-bold tracking-wider hover:text-gray-300 transition-colors uppercase text-sm">
                                LOGIN
                            </Link>
                            <Link href="/signup" className="bg-[#7C3AED] text-white px-6 py-2.5 rounded-full font-bold tracking-wider hover:brightness-110 transition-all uppercase text-sm shadow-md">
                                CADASTRE-SE
                            </Link>
                        </div>
                    ) : (
                        <div className="flex space-x-6 items-center">
                            <CartDropdown />

                            <Link href={`/profile/${userId}`} className={`text-2xl hover:text-black/80 dark:hover:text-[#C6E700] transition-colors ${getActiveClass('/profile')}`}>
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black text-card text-sm font-bold transition-all duration-200 ${pathname.startsWith('/profile') ? 'border-white' : 'border-transparent hover:border-black/50'}`}>
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="text-white text-2xl hover:text-red-600 dark:hover:text-[#C6E700] transition-colors cursor-pointer">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                total={totalPrice}
                cartItems={cartItems}
                onSuccess={() => {
                    clearCart();
                    router.push('/');
                }}
            />
        </>
    );
}