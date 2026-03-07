import type { Metadata } from 'next';
import './globals.css';

import { FirebaseClientProvider } from '../firebase/client-provider';

export const metadata: Metadata = {
  title: 'FleetWise',
  description: 'Sistema de gestão',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="pt-BR" />
      </head>
      <body translate="no">
        <FirebaseClientProvider>{children}</FirebaseClientProvider>
      </body>
    </html>
  );
}