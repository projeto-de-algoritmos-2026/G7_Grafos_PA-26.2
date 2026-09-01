import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'STOCK.IO - Login',
  description: 'Faça login no Stock.io',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}