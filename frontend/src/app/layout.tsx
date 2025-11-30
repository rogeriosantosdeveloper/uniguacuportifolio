import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portfólio Uniguaçu',
  description: 'Portfólio de projetos dos alunos da Faculdade Uniguaçu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-800 antialiased`}>
        <AuthProvider>
          {/* Este div é o container principal.
            - flex e flex-col: Organiza os filhos verticalmente.
            - min-h-screen: Garante que o container tenha pelo menos a altura da tela.
          */}
          <div className="flex flex-col min-h-screen">
            <Header />
            
            {/* Conteúdo principal com flex-1 para empurrar o footer para baixo */}
            <main className="flex-1">
              {children}
            </main>
            
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

