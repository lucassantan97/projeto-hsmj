
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Car, Layers, Search, Warehouse } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import VehicleGroup from './vehicle-group';
import type { Vehicle, Group, CompanyId, MaintenanceAlert } from '@/lib/types';
import AddEditVehicleModal from '../modals/add-edit-vehicle-modal';
import ManageGroupsModal from '../modals/manage-groups-modal';
import { useMaintenanceAlerts } from '@/hooks/use-maintenance-alerts';
import MaintenanceAlerts from './maintenance-alerts';
import { useLicensingAlerts } from '@/hooks/use-licensing-alerts';
import LicensingAlerts from './licensing-alerts';

interface ActiveFleetViewProps {
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  groups: Group[];
  loading: boolean;
  companyId: CompanyId;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  onUpdateGroup: (id: string, newName: string) => void;
  onDeleteGroup: (id: string) => void;
}

export default function ActiveFleetView({ 
  vehicles, 
  allVehicles,
  groups, 
  loading, 
  companyId, 
  onUpdateVehicle, 
  onAddVehicle,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup 
}: ActiveFleetViewProps) {
  const [search, setSearch] = useState('');
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isGroupsModalOpen, setGroupsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleModalOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    if (!search) return vehicles;
    const searchTerm = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.placa.toLowerCase().includes(searchTerm) ||
        v.modelo.toLowerCase().includes(searchTerm) ||
        v.cliente.toLowerCase().includes(searchTerm)
    );
  }, [search, vehicles]);

  const maintenanceAlerts = useMaintenanceAlerts(filteredVehicles);
  const licensingAlerts = useLicensingAlerts(filteredVehicles);

  const vehicleGroups = useMemo(() => {
    const activeVehicles = filteredVehicles.filter(v => v.status === 'ativo');
    const groupNamesFromVehicles = [...new Set(activeVehicles.map((v) => v.cliente))];
    const groupNamesFromConfig = groups.map(g => g.name);
    const allGroupNames = [...new Set([...groupNamesFromVehicles, ...groupNamesFromConfig])].sort();

    return allGroupNames.map(groupName => ({
        name: groupName,
        vehicles: activeVehicles
            .filter(v => v.cliente === groupName)
            .sort((a,b) => a.placa.localeCompare(b.placa)),
    }));
  }, [filteredVehicles, groups]);

  const handleDragEnd = (vehicleId: string, newGroupName: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if(vehicle && vehicle.cliente !== newGroupName) {
      onUpdateVehicle({...vehicle, cliente: newGroupName});
    }
  }

  const findVehicleById = (id: string) => allVehicles.find(v => v.id === id);

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por placa, modelo, grupo..."
            className="w-full p-4 pl-12 h-14 bg-card border rounded-xl shadow-sm focus:ring-2 ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="bg-card font-bold py-3 px-5 rounded-xl shadow h-14"
            onClick={() => setGroupsModalOpen(true)}
          >
            <Layers className="mr-2 h-4 w-4" /> Grupos
          </Button>
          <Button
            className="font-bold py-3 px-6 rounded-xl shadow-lg h-14"
            onClick={handleOpenAddVehicle}
          >
            <Car className="mr-2 h-4 w-4" /> Adicionar Veículo
          </Button>
        </div>
      </div>
      
      {!loading && (licensingAlerts.length > 0 || maintenanceAlerts.length > 0) && (
        <div className="mb-6 space-y-3">
          <LicensingAlerts alerts={licensingAlerts} findVehicleById={findVehicleById} />
          <MaintenanceAlerts alerts={maintenanceAlerts} findVehicleById={findVehicleById} />
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl shadow-sm p-4">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && vehicleGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed">
          <div className="bg-muted p-6 rounded-full mb-4">
            <Warehouse className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Nenhum veículo nesta empresa
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Adicione um veículo ou ajuste sua busca.
          </p>
        </div>
      )}
      
      {!loading && vehicleGroups.length > 0 && (
        <div className="space-y-4 pb-20">
          {vehicleGroups.map((group, index) => (
            <VehicleGroup 
              key={group.name} 
              group={group} 
              onVehicleDrop={handleDragEnd}
              companyId={companyId}
              allVehicles={allVehicles}
              groups={groups}
              onUpdateVehicle={onUpdateVehicle}
              onAddVehicle={onAddVehicle}
              onAddGroup={onAddGroup}
            />
          ))}
        </div>
      )}

      <AddEditVehicleModal 
        isOpen={isVehicleModalOpen}
        setIsOpen={setVehicleModalOpen}
        vehicle={editingVehicle}
        allVehicles={allVehicles}
        groups={groups}
        companyId={companyId}
        onSave={(vehicleData) => {
            if(editingVehicle) {
                onUpdateVehicle({...editingVehicle, ...vehicleData});
            } else {
                onAddVehicle(vehicleData);
            }
        }}
      />

      <ManageGroupsModal 
        isOpen={isGroupsModalOpen}
        setIsOpen={setGroupsModalOpen}
        groups={groups}
        onAddGroup={onAddGroup}
        onUpdateGroup={onUpdateGroup}
        onDeleteGroup={onDeleteGroup}
        companyId={companyId}
      />
    </section>
  );
}
