'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { COMPANIES, type CompanyId, type User } from '@/lib/types';
import { Power, Replace } from 'lucide-react';
import { HsLogo } from '../icons/hs-logo';
import { MjLogo } from '../icons/mj-logo';

interface HeaderProps {
  user: User;
  companyId: CompanyId;
  onLogout: () => void;
  onChangeCompany: () => void;
}

export default function Header({ user, companyId, onLogout, onChangeCompany }: HeaderProps) {
  const company = COMPANIES[companyId];
  const themeClass = `border-${company.theme.primary}`;

  return (
    <header
      className={`bg-card rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-l-8 ${themeClass}`}
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="transform scale-90 origin-left">
          {companyId === 'HS' ? <HsLogo /> : <MjLogo />}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground uppercase tracking-tight">
            {company.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-background bg-foreground px-2 py-0.5 rounded">
              MATRIZ
            </span>
            <p className="text-xs font-code text-muted-foreground">{company.cnpj}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-foreground">{user.name}</p>
          <Button variant="link" size="sm" onClick={onChangeCompany} className={`text-${company.theme.primary} p-0 h-auto`}>
            <Replace className="mr-1 h-3 w-3" />
            Trocar Empresa
          </Button>
        </div>
        <Avatar className={`border-2 border-${company.theme.primary} shadow-sm`}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
          <Power className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
