'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HsLogo } from '@/components/icons/hs-logo';
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import FullPageLoader from '@/components/ui/loader';

// Simplified form data type
type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // If a user session exists (anonymous or otherwise), redirect to the main app
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: 'hs@hslocadora.com',
      password: 'prisma35',
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setError(null);
    // Hardcoded credential check
    if (data.email === 'hs@hslocadora.com' && data.password === 'prisma35') {
      try {
        // Sign in anonymously to create a valid Firebase session
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        // Let the useEffect handle the redirection. It will trigger once the user state changes.
      } catch (e: any) {
        console.error("Anonymous sign-in error:", e);
        setError('Ocorreu um erro inesperado durante o login. Por favor, tente novamente.');
      }
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  // Show a loader while checking auth state or if a user object already exists (to allow redirect to finish)
  if (isUserLoading || user) {
    return <FullPageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-primary">
        <CardContent className="p-8">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center mb-4">
                <HsLogo />
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground">
              <span>Acesso ao Sistema</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Use as credenciais para entrar.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erro de Login</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-base" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
