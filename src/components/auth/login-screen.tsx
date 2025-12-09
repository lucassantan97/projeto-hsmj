'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HsLogo } from '../icons/hs-logo';
import { MjLogo } from '../icons/mj-logo';
import { Mail } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    const emailToLogin = email || prompt('Por favor, insira seu e-mail para login:');
    if (emailToLogin) {
      onLogin(emailToLogin);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-card flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="flex items-center gap-8 mb-10 slide-in-up">
        <div className="flex flex-col items-center transform hover:scale-110 transition duration-300">
          <HsLogo />
          <span className="text-xs font-bold text-muted-foreground mt-2 tracking-widest">
            LOCADORA
          </span>
        </div>
        <div className="h-16 w-px bg-border"></div>
        <div className="flex flex-col items-center transform hover:scale-110 transition duration-300">
          <MjLogo />
          <div className="flex items-center mt-1">
            <span className="font-black text-secondary-foreground">M</span>
            <span className="font-black text-mjOrange">J</span>
            <span className="text-xs font-bold text-muted-foreground ml-1 tracking-widest">
              LOCADORA
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
        Portal de Gestão BI
      </h1>
      <p className="text-muted-foreground">FleetWise AI</p>

      <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm px-4">
        <div className="relative w-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
                type="email"
                placeholder="seunome@hslocadora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="pl-10 h-12"
            />
        </div>
        <Button
          onClick={handleLogin}
          className="w-full flex items-center gap-3 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all h-12 rounded-lg"
        >
          <span className="font-semibold text-base">Entrar com E-mail</span>
        </Button>
      </div>
    </div>
  );
}
