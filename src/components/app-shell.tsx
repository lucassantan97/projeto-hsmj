'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './auth/login-screen';
import CompanySelector from './auth/company-selector';
import MainLayout from './layout/main-layout';
import type { CompanyId, Vehicle, Group, User } from '@/lib/types';
import { mockUser, mockVehicles, mockGroups } from '@/lib/mock-data';
import AiChatWidget from './ai-chat-widget';

type AuthState = 'login' | 'company-select' | 'app';

const AppShell = () => {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth state check
    const lastCompany = localStorage.getItem('fleetwise_last_company') as CompanyId | null;
    if (lastCompany) {
      handleLogin();
      handleCompanySelect(lastCompany);
    } else {
      // Stay on login screen
    }
  }, []);
  
  const loadDataForCompany = useCallback((companyId: CompanyId) => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setVehicles(mockVehicles.filter(v => v.empresa === companyId));
      setGroups(mockGroups.filter(g => g.company === companyId));
      setLoading(false);
    }, 500);
  }, []);

  const handleLogin = () => {
    setUser(mockUser);
    setAuthState('company-select');
  };

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
    switch (authState) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'company-select':
        if (!user) return <LoginScreen onLogin={handleLogin} />; // Should not happen
        return (
          <CompanySelector
            user={user}
            onSelectCompany={handleCompanySelect}
            onLogout={handleLogout}
          />
        );
      case 'app':
        if (!user || !selectedCompany) return <LoginScreen onLogin={handleLogin} />; // Should not happen
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
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
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
