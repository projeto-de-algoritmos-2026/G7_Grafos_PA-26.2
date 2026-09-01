import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'STOCK.IO - Cadastro',
  description: 'Crie sua conta no Stock.io',
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}