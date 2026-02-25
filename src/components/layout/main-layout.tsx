'use client';

import React from 'react';
import Header from './header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActiveFleetView from '../fleet/active-fleet-view';
import SoldFleetView from '../fleet/sold-fleet-view';
import BiDashboard from '../dashboard/bi-dashboard';
import { Layers, FileText, PieChart, Tag } from 'lucide-react';
import type { CompanyId, User, Vehicle, Group } from '@/lib/types';
import { COMPANIES } from '@/lib/types';
import SalesView from '../fleet/sales-view';

interface MainLayoutProps {
  user: User;
  companyId: CompanyId;
  vehicles: Vehicle[];
  groups: Group[];
  loading: boolean;
  onLogout: () => void;
  onChangeCompany: () => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'ownerUserId'>) => void;
  onAddGroup: (group: Omit<Group, 'id' | 'ownerUserId' | 'order'>) => void;
  onUpdateGroup: (id: string, data: Partial<Group>) => void;
  onDeleteGroup: (id: string) => void;
}

export default function MainLayout({
  user,
  companyId,
  vehicles,
  groups,
  loading,
  onLogout,
  onChangeCompany,
  onUpdateVehicle,
  onAddVehicle,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: MainLayoutProps) {
  const companyTheme = COMPANIES[companyId].theme.primary;

  return (
    <div className={`container mx-auto p-4 md:p-6 min-h-screen flex flex-col bg-background/80`}>
      <Header
        user={user}
        companyId={companyId}
        onLogout={onLogout}
        onChangeCompany={onChangeCompany}
      />
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card shadow-sm p-2 mb-6 h-auto">
          <TabsTrigger value="active" className="py-3 text-sm md:text-base data-[state=active]:shadow-md">
            <Layers className="mr-2 h-4 w-4" /> Frota Ativa
          </TabsTrigger>
          <TabsTrigger value="sold" className="py-3 text-sm md:text-base data-[state=active]:shadow-md">
            <FileText className="mr-2 h-4 w-4" /> Histórico Vendas
          </TabsTrigger>
          <TabsTrigger value="sales" className="py-3 text-sm md:text-base data-[state=active]:shadow-md">
            <Tag className="mr-2 h-4 w-4" /> Vendas
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="py-3 text-sm md:text-base data-[state=active]:shadow-md">
            <PieChart className="mr-2 h-4 w-4" /> Dashboard BI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ActiveFleetView 
            vehicles={vehicles.filter(v => v.status === 'ativo')} 
            allVehicles={vehicles}
            groups={groups}
            loading={loading}
            companyId={companyId}
            onUpdateVehicle={onUpdateVehicle}
            onAddVehicle={onAddVehicle}
            onAddGroup={onAddGroup}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
          />
        </TabsContent>
        <TabsContent value="sold">
          <SoldFleetView 
            vehicles={vehicles}
            companyId={companyId}
            onUpdateVehicle={onUpdateVehicle}
            groups={groups}
            onAddVehicle={onAddVehicle}
            onAddGroup={onAddGroup}
          />
        </TabsContent>
        <TabsContent value="sales">
          <SalesView
            vehicles={vehicles}
            companyId={companyId}
            onUpdateVehicle={onUpdateVehicle}
          />
        </TabsContent>
        <TabsContent value="dashboard">
          <BiDashboard vehicles={vehicles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
