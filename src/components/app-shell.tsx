'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, writeBatch, getDocs } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import CompanySelector from './auth/company-selector';
import MainLayout from './layout/main-layout';
import type { CompanyId, Vehicle, Group, User } from '@/lib/types';
import AiChatWidget from './ai-chat-widget';
import FullPageLoader from './ui/loader';

const mockUser: User = {
  name: 'Analista',
  avatarUrl: `https://i.pravatar.cc/150?u=analista`
};

const AppShell = () => {
  const [authState, setAuthState] = useState<'loading' | 'company-select' | 'app'>('loading');
  const [userState] = useState<User>(mockUser);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const vehiclesQuery = useMemoFirebase(() => {
    if (!user || !selectedCompany) return null;
    return query(
      collection(firestore, 'users', user.uid, 'vehicles'),
      where('empresa', '==', selectedCompany)
    );
  }, [user, selectedCompany, firestore]);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useCollection<Vehicle>(vehiclesQuery);
  const vehicles = vehiclesData || [];
  
  const groupsQuery = useMemoFirebase(() => {
    if (!user || !selectedCompany) return null;
    return query(
      collection(firestore, 'users', user.uid, 'vehicleGroups'),
      where('company', '==', selectedCompany)
    );
  }, [user, selectedCompany, firestore]);
  const { data: groupsData, isLoading: groupsLoading } = useCollection<Group>(groupsQuery);
  const groups = groupsData || [];

  const handleCompanySelect = useCallback((companyId: CompanyId) => {
    setSelectedCompany(companyId);
    setAuthState('app');
    localStorage.setItem('fleetwise_last_company', companyId);
  }, []);
  
  useEffect(() => {
    const lastCompany = localStorage.getItem('fleetwise_last_company') as CompanyId | null;
    if (lastCompany) {
      handleCompanySelect(lastCompany);
    } else {
      setAuthState('company-select');
    }
  }, [handleCompanySelect]);

  const handleChangeCompany = useCallback(() => {
    setSelectedCompany(null);
    setAuthState('company-select');
    localStorage.removeItem('fleetwise_last_company');
  }, []);

  const handleLogout = () => {
    handleChangeCompany();
  };
  
  const updateVehicle = (updatedVehicle: Vehicle) => {
    if (!user) return;
    const vehicleRef = doc(firestore, 'users', user.uid, 'vehicles', updatedVehicle.id);
    setDocumentNonBlocking(vehicleRef, updatedVehicle, { merge: true });
  }

  const addVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    if (!user) return;
    const newDocRef = doc(collection(firestore, 'users', user.uid, 'vehicles'));
    const vehicleWithId: Vehicle = {
      ...newVehicle,
      id: newDocRef.id,
      ownerUserId: user.uid,
    };
    setDocumentNonBlocking(newDocRef, vehicleWithId, {});
  };

  const addGroup = (newGroup: Omit<Group, 'id'>) => {
    if(!user) return;
    const newDocRef = doc(collection(firestore, 'users', user.uid, 'vehicleGroups'));
    const groupWithId: Group = {
      ...newGroup,
      id: newDocRef.id,
      ownerUserId: user.uid,
    };
    setDocumentNonBlocking(newDocRef, groupWithId, {});
  }

  const updateGroup = async (id: string, newName: string) => {
    if (!user || !selectedCompany) return;
    
    const oldName = groups.find(g => g.id === id)?.name;

    // 1. Update the group document
    const groupRef = doc(firestore, 'users', user.uid, 'vehicleGroups', id);
    setDocumentNonBlocking(groupRef, { name: newName }, { merge: true });

    // 2. Update all vehicles using this group
    if (oldName && oldName !== newName) {
      const vehiclesToUpdateQuery = query(
        collection(firestore, 'users', user.uid, 'vehicles'),
        where('cliente', '==', oldName),
        where('empresa', '==', selectedCompany)
      );
      
      const querySnapshot = await getDocs(vehiclesToUpdateQuery);
      const batch = writeBatch(firestore);
      querySnapshot.forEach((document) => {
        batch.update(document.ref, { cliente: newName });
      });
      await batch.commit();
    }
  }

  const deleteGroup = (id: string) => {
    if (!user) return;
    const groupRef = doc(firestore, 'users', user.uid, 'vehicleGroups', id);
    deleteDocumentNonBlocking(groupRef);
  }

  const renderContent = () => {
    switch (authState) {
      case 'loading':
        return <FullPageLoader />;
      case 'company-select':
        return (
          <CompanySelector
            user={userState}
            onSelectCompany={handleCompanySelect}
            onLogout={handleLogout}
          />
        );
      case 'app':
        if (!selectedCompany) return <FullPageLoader />;
        return (
          <MainLayout
            user={userState}
            companyId={selectedCompany}
            vehicles={vehicles}
            groups={groups}
            loading={vehiclesLoading || groupsLoading}
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
      {authState === 'app' && <AiChatWidget vehicles={vehicles} groups={groups} />}
    </div>
  );
};

export default AppShell;
