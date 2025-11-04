
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Aiuto Directo Santiago – Cuballama live',
  description: 'Combo aggiornate da Cuballama in tempo reale'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        <header>
          <div className="container header-inner">
            <strong>Aiuto Directo Santiago</strong>
            <nav>
              <a href="/">Home</a>
              <a href="/admin">Admin</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer>© 2025 Aiuto Directo Santiago</footer>
      </body>
    </html>
  );
}
