'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CompanySelector from './auth/company-selector';
import MainLayout from './layout/main-layout';
import type { CompanyId, Vehicle, Group, User } from '@/lib/types';
import { mockVehicles, mockGroups } from '@/lib/mock-data';
import AiChatWidget from './ai-chat-widget';
import FullPageLoader from './ui/loader';

const mockUser: User = {
  name: 'Analista',
  avatarUrl: `https://i.pravatar.cc/150?u=analista`
};

const AppShell = () => {
  const [authState, setAuthState] = useState<'loading' | 'company-select' | 'app'>('loading');
  const [user] = useState<User>(mockUser);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDataForCompany = useCallback((companyId: CompanyId) => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setVehicles(mockVehicles.filter(v => v.empresa === companyId));
      setGroups(mockGroups.filter(g => g.company === companyId));
      setLoading(false);
    }, 500);
  }, []);
  
  const handleCompanySelect = useCallback((companyId: CompanyId) => {
    setSelectedCompany(companyId);
    setAuthState('app');
    loadDataForCompany(companyId);
    localStorage.setItem('fleetwise_last_company', companyId);
  }, [loadDataForCompany]);
  
  useEffect(() => {
    const lastCompany = localStorage.getItem('fleetwise_last_company') as CompanyId | null;
    if (lastCompany) {
      handleCompanySelect(lastCompany);
    } else {
      setAuthState('company-select');
      setLoading(false);
    }
  }, [handleCompanySelect]);

  const handleChangeCompany = useCallback(() => {
    setSelectedCompany(null);
    setAuthState('company-select');
    localStorage.removeItem('fleetwise_last_company');
    setVehicles([]);
    setGroups([]);
  }, []);

  const handleLogout = () => {
    // Since there's no real login, logout will just go back to company select
    handleChangeCompany();
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
      case 'loading':
        return <FullPageLoader />;
      case 'company-select':
        return (
          <CompanySelector
            user={user}
            onSelectCompany={handleCompanySelect}
            onLogout={handleLogout}
          />
        );
      case 'app':
        if (!selectedCompany) return <FullPageLoader />;
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
        return <FullPageLoader />;
    }
  };

  return (
    <div style={{ backgroundColor: 'hsl(var(--background))' }} className="min-h-screen">
      {renderContent()}
      {authState === 'app' && <AiChatWidget vehicles={vehicles} />}
    </div>
  );
};

export default AppShell;
