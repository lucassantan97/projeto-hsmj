'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './auth/login-screen';
import CompanySelector from './auth/company-selector';
import MainLayout from './layout/main-layout';
import type { CompanyId, Vehicle, Group, User } from '@/lib/types';
import { mockVehicles, mockGroups } from '@/lib/mock-data';
import AiChatWidget from './ai-chat-widget';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const AppShell = () => {
  const [authState, setAuthState] = useState<'loading' | 'login' | 'company-select' | 'app'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { auth, isUserLoading, user: firebaseUser } = useFirebase();

  const handleFirebaseAuth = useCallback((fbUser: FirebaseUser | null) => {
    if (fbUser) {
      if (fbUser.email?.toLowerCase() === 'hs@hslocadora.com') {
        const appUser: User = {
          name: fbUser.displayName || 'Analista',
          avatarUrl: fbUser.photoURL || `https://i.pravatar.cc/150?u=${fbUser.email}`
        };
        setUser(appUser);
        const lastCompany = localStorage.getItem('fleetwise_last_company') as CompanyId | null;
        if (lastCompany) {
          handleCompanySelect(lastCompany);
        } else {
          setAuthState('company-select');
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Este e-mail não tem permissão para acessar o sistema.',
        });
        if (auth) {
          signOut(auth);
        }
        setUser(null);
        setAuthState('login');
      }
    } else {
      setUser(null);
      setAuthState('login');
    }
  }, [auth, toast]);

  useEffect(() => {
    if (!isUserLoading) {
      handleFirebaseAuth(firebaseUser);
    }
  }, [isUserLoading, firebaseUser, handleFirebaseAuth]);

  const loadDataForCompany = useCallback((companyId: CompanyId) => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setVehicles(mockVehicles.filter(v => v.empresa === companyId));
      setGroups(mockGroups.filter(g => g.company === companyId));
      setLoading(false);
    }, 500);
  }, []);

  const handleCompanySelect = (companyId: CompanyId) => {
    setSelectedCompany(companyId);
    setAuthState('app');
    loadDataForCompany(companyId);
    localStorage.setItem('fleetwise_last_company', companyId);
  };
  
  const handleChangeCompany = () => {
    setSelectedCompany(null);
    setAuthState('company-select');
    localStorage.removeItem('fleetwise_last_company');
    setVehicles([]);
    setGroups([]);
  }

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
    setUser(null);
    setSelectedCompany(null);
    setAuthState('login');
    localStorage.removeItem('fleetwise_last_company');
  };
  
  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  }

  const addVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    const vehicleWithId = { ...newVehicle, id: Date.now().toString() };
    setVehicles(prev => [...prev, vehicleWithId]);
  };

  const addGroup = (newGroup: Omit<Group, 'id'>) => {
    const groupWithId = { ...newGroup, id: Date.now().toString() };
    setGroups(prev => [...prev, groupWithId]);
  }

  const updateGroup = (id: string, newName: string) => {
    setGroups(prev => prev.map(g => g.id === id ? {...g, name: newName} : g));
    const oldName = groups.find(g => g.id === id)?.name;
    if (oldName) {
      setVehicles(prev => prev.map(v => v.cliente === oldName ? {...v, cliente: newName} : v));
    }
  }

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }


  const renderContent = () => {
    if (authState === 'loading' || isUserLoading) {
      return (
        <div className="fixed inset-0 z-[100] bg-card flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      );
    }

    switch (authState) {
      case 'login':
        return <LoginScreen />;
      case 'company-select':
        if (!user) return <LoginScreen />; // Should not happen
        return (
          <CompanySelector
            user={user}
            onSelectCompany={handleCompanySelect}
            onLogout={handleLogout}
          />
        );
      case 'app':
        if (!user || !selectedCompany) return <LoginScreen />; // Should not happen
        return (
          <MainLayout
            user={user}
            companyId={selectedCompany}
            vehicles={vehicles}
            groups={groups}
            loading={loading}
            onLogout={handleLogout}
            onChangeCompany={handleChangeCompany}
            onUpdateVehicle={updateVehicle}
            onAddVehicle={addVehicle}
            onAddGroup={addGroup}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
          />
        );
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }} className="min-h-screen">
      {renderContent()}
      {authState === 'app' && <AiChatWidget />}
    </div>
  );
};

export default AppShell;
