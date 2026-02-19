'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HsLogo } from '@/components/icons/hs-logo';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setError(null);
    // This is where the login logic will go.
    console.log(data);
    // In a real app, you would now call your sign-in action
    // const result = await signInAction(data);
    // if (!result.success) {
    //   setError(result.error);
    // } else {
    //   router.push('/');
    // }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-8 border-primary">
        <CardContent className="p-8">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center mb-4">
                <HsLogo />
            </div>
            <h1 className="text-3xl font-headline font-bold text-foreground">
              Bem-vindo de Volta!
            </h1>
            <p className="text-muted-foreground mt-2">
              Acesse sua conta para gerenciar a frota.
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

          <div className="mt-6 flex justify-between text-sm">
            <Link href="/signup" className="text-primary hover:underline">
              Criar uma conta
            </Link>
            <Link href="/forgot-password" className="text-muted-foreground hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
