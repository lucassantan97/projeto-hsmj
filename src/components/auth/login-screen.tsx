'use client';

import { Button } from '@/components/ui/button';
import { HsLogo } from '../icons/hs-logo';
import { MjLogo } from '../icons/mj-logo';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Chrome } from 'lucide-react';

export default function LoginScreen() {
  const { auth } = useFirebase();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error.message || 'Não foi possível fazer login com o Google.',
      });
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
        <Button
          onClick={handleGoogleLogin}
          className="w-full flex items-center gap-3 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all h-12 rounded-lg"
        >
          <Chrome className="h-5 w-5" />
          <span className="font-semibold text-base">Entrar com Google</span>
        </Button>
      </div>
    </div>
  );
}
