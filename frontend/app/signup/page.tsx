'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Erro ao realizar cadastro.');
      }

      setSuccess('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar ao servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-[#F5F2EB] flex flex-col justify-between relative overflow-hidden select-none">

      <header className="lg:hidden pt-5 px-8 sm:pt-6 sm:px-12 z-20 shrink-0 flex justify-center">
        <div className="inline-block transition-transform duration-300 hover:scale-[1.03] cursor-default select-none">
          <Image
            src="/Logo.svg"
            alt="STOCK.IO"
            width={320}
            height={90}
            priority
            className="h-auto w-52 sm:w-64 object-contain"
          />
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-center lg:items-end justify-between px-6 sm:px-10 lg:px-[200px] xl:px-[240px] relative z-10 overflow-hidden">

        <div className="w-full lg:w-[654px] shrink-0 flex justify-center lg:justify-start h-full max-h-[92vh] items-end">
          <div className="w-full max-w-[654px] lg:w-[654px] bg-[#17181A] text-white rounded-t-[36px] sm:rounded-t-[44px] rounded-b-none px-8 sm:px-14 lg:px-16 pt-[112px] pb-8 sm:pb-10 shadow-2xl h-full flex flex-col justify-start overflow-hidden">

            <h1 className="text-[#F6F3E4] text-2xl sm:text-[44px] font-black tracking-wide text-center uppercase leading-tight m-0 mb-[60px]">
              CRIE SUA CONTA
            </h1>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs sm:text-sm text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm text-center font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-13 px-6 rounded-full bg-[#F6F3E4] text-[#17181A] text-base placeholder-[#9E9B94] font-medium outline-none focus:ring-3 focus:ring-[#6032F6]/50 transition-all disabled:opacity-75"
                />
              </div>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-13 px-6 rounded-full bg-[#F6F3E4] text-[#17181A] text-base placeholder-[#9E9B94] font-medium outline-none focus:ring-3 focus:ring-[#6032F6]/50 transition-all disabled:opacity-75"
                />
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-13 pl-6 pr-14 rounded-full bg-[#F6F3E4] text-[#17181A] text-base placeholder-[#9E9B94] font-medium outline-none focus:ring-3 focus:ring-[#6032F6]/50 transition-all disabled:opacity-75"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#17181A]/60 hover:text-[#17181A] transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5 text-[#17181A]/70 hover:text-[#17181A] transition-colors" />
                  ) : (
                    <FaEye className="w-5 h-5 text-[#17181A]/70 hover:text-[#17181A] transition-colors" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-13 pl-6 pr-14 rounded-full bg-[#F6F3E4] text-[#17181A] text-base placeholder-[#9E9B94] font-medium outline-none focus:ring-3 focus:ring-[#6032F6]/50 transition-all disabled:opacity-75"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#17181A]/60 hover:text-[#17181A] transition-colors p-1 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="w-5 h-5 text-[#17181A]/70 hover:text-[#17181A] transition-colors" />
                  ) : (
                    <FaEye className="w-5 h-5 text-[#17181A]/70 hover:text-[#17181A] transition-colors" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-full bg-[#6032F6] hover:bg-[#5227DF] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed text-white font-extrabold text-base tracking-wider uppercase transition-all shadow-lg hover:shadow-[#6032F6]/30 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>CRIANDO CONTA...</span>
                  </div>
                ) : (
                  'CRIAR CONTA'
                )}
              </button>
            </form>

            <div className="mt-[30px] mb-2 text-center text-sm text-zinc-300 font-medium">
              Já possui uma conta?{' '}
              <Link
                href="/login"
                className="text-[#6032F6] hover:text-[#784BF8] font-bold hover:underline transition-colors ml-1"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 flex-col justify-between items-center h-full pt-6 pb-0">

          <div className="w-full flex justify-center pointer-events-auto">
            <div className="inline-block transition-transform duration-300 hover:scale-[1.03] cursor-default select-none">
              <Image
                src="/Logo.svg"
                alt="STOCK.IO"
                width={420}
                height={120}
                priority
                className="h-auto w-72 lg:w-[350px] xl:w-[390px] object-contain drop-shadow-xs"
              />
            </div>
          </div>

          <div className="w-full flex justify-center items-end h-full max-h-[82vh] pointer-events-none">
            <Image
              src="/StockLee.svg"
              alt="StockLee Mascot"
              width={540}
              height={780}
              priority
              className="object-contain object-bottom h-full max-h-[82vh] w-auto drop-shadow-sm select-none"
            />
          </div>
        </div>
      </div>
    </main>
  );
}