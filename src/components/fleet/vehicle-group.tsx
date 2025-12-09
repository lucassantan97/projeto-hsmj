'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '../ui/card';
import VehicleCard from './vehicle-card';
import { formatCurrency } from '@/lib/utils';
import type { Vehicle, CompanyId, Group } from '@/lib/types';
import { Folder } from 'lucide-react';
import VehicleDetailsModal from '../modals/vehicle-details-modal';

interface VehicleGroupProps {
  group: {
    name: string;
    vehicles: Vehicle[];
  };
  onVehicleDrop: (vehicleId: string, newGroupName: string) => void;
  companyId: CompanyId;
  allVehicles: Vehicle[];
  groups: Group[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
}

export default function VehicleGroup({ 
  group, 
  onVehicleDrop, 
  companyId, 
  allVehicles, 
  groups,
  onUpdateVehicle, 
  onAddVehicle,
  onAddGroup 
}: VehicleGroupProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const totalValue = group.vehicles.reduce((sum, v) => sum + (v.valorCompra || 0), 0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const vehicleId = e.dataTransfer.getData('text/plain');
    onVehicleDrop(vehicleId, group.name);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };

  return (
    <>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <Card
            className={`bg-card rounded-xl shadow-sm border mb-4 overflow-hidden transition-all ${isDragOver ? 'border-primary ring-2 ring-primary' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <AccordionTrigger className="p-4 bg-card hover:bg-muted/50 flex justify-between items-center cursor-pointer w-full">
              <div className="flex items-center">
                <Folder className="mr-3 h-5 w-5 text-yellow-500" />
                <h3 className="font-bold font-headline text-lg text-foreground">
                  {group.name} ({group.vehicles.length})
                </h3>
              </div>
              <span className="text-sm font-bold text-muted-foreground">{formatCurrency(totalValue)}</span>
            </AccordionTrigger>
            <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-background">
              {group.vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={() => openDetailsModal(vehicle)}
                />
              ))}
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
      
      {selectedVehicle && (
        <VehicleDetailsModal
          isOpen={isDetailsModalOpen}
          setIsOpen={setDetailsModalOpen}
          vehicle={selectedVehicle}
          allVehicles={allVehicles}
          companyId={companyId}
          groups={groups}
          onUpdateVehicle={onUpdateVehicle}
          onAddVehicle={onAddVehicle}
          onAddGroup={onAddGroup}
        />
      )}
    </>
  );
}
