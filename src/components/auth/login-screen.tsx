'use client';

import { Button } from '@/components/ui/button';
import { HsLogo } from '../icons/hs-logo';
import { MjLogo } from '../icons/mj-logo';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

export default function LoginScreen() {
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Erro de Configuração",
            description: "A autenticação não foi inicializada corretamente.",
        });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in AppShell will handle the rest
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro durante o login com o Google.",
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
      <Button
        onClick={handleLogin}
        className="fade-in flex items-center gap-3 bg-card border shadow-lg hover:bg-muted transition-all mt-8 px-8 py-6 rounded-full"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          className="w-6 h-6"
          alt="Google"
        />
        <span className="font-semibold text-base">Entrar com Google</span>
      </Button>
    </div>
  );
}
