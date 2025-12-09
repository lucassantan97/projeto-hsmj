'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CompanySelector from './auth/company-selector';
import MainLayout from './layout/main-layout';
import type { CompanyId, Vehicle, Group, User } from '@/lib/types';
import { mockVehicles, mockGroups } from '@/lib/mock-data';
import AiChatWidget from './ai-chat-widget';

const mockUser: User = {
  name: 'Analista',
  avatarUrl: `https://i.pravatar.cc/150?u=analista`
};

const AppShell = () => {
  const [authState, setAuthState] = useState<'company-select' | 'app'>('company-select');
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
  
  useEffect(() => {
    // No auth, go straight to company select
    setAuthState('company-select');
    setLoading(false); // No data to load initially
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
    // Since there's no login, logout will just go back to company select
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
      case 'company-select':
        return (
          <CompanySelector
            user={user}
            onSelectCompany={handleCompanySelect}
            onLogout={() => { /* No real logout, but keep prop for component */ }}
          />
        );
      case 'app':
        if (!selectedCompany) return null;
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
        return null;
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
