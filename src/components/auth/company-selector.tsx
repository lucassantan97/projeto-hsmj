'use client';
// Force rebuild: 2026-09-13T02:30:00Z

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { User, CompanyId } from '@/lib/types';
import { LogOut } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface CompanySelectorProps {
  user: User;
  onSelectCompany: (company: CompanyId) => void;
  onLogout: () => void;
}

export default function CompanySelector({ user, onSelectCompany, onLogout }: CompanySelectorProps) {
  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col items-center justify-center fade-in p-4">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground mb-2">
        Bem-vindo(a), <span className="text-primary">Chefe</span>
      </h2>
      <p className="text-muted-foreground mb-10">
        Selecione a empresa para gerenciar:
      </p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <Card
          onClick={() => onSelectCompany('HS')}
          className="flex-1 p-8 rounded-2xl shadow-lg border-b-8 border-hsRed hover:-translate-y-2 hover:shadow-2xl transition-all group relative overflow-hidden cursor-pointer"
        >
          <CardContent className="relative z-10 flex flex-col items-center p-0">
            <div className="w-28 h-20 relative mb-4 flex items-center justify-center">
              <Image 
                src="/hs-logo.png" 
                alt="HS Locadora" 
                width={112} 
                height={80} 
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold font-headline text-foreground">
              <span>HS Locadora</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1 font-code bg-muted px-2 rounded">
              CNPJ: 10.606.395/0001-24
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => onSelectCompany('MJ')}
          className="flex-1 p-8 rounded-2xl shadow-lg border-b-8 border-mjOrange hover:-translate-y-2 hover:shadow-2xl transition-all group relative overflow-hidden cursor-pointer"
        >
          <CardContent className="relative z-10 flex flex-col items-center p-0">
            <div className="w-28 h-20 relative mb-4 flex items-center justify-center">
              <Image 
                src="/mj-logo.png" 
                alt="MJ Locadora" 
                width={112} 
                height={80} 
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold font-headline text-foreground">
              MJ Locadora
            </h3>
            <p className="text-sm text-muted-foreground mt-1 font-code bg-muted px-2 rounded">
              CNPJ: 40.108.340/0001-24
            </p>
          </CardContent>
        </Card>
      </div>
      <Button variant="ghost" onClick={onLogout} className="mt-12 text-muted-foreground hover:text-destructive">
        <LogOut className="mr-2 h-4 w-4" /> Sair da conta
      </Button>
    </div>
  );
}