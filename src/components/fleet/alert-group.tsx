
'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '../ui/card';
import VehicleCard from './vehicle-card';
import type { Vehicle, CompanyId, Group } from '@/lib/types';
import { Wrench, FileBadge } from 'lucide-react';
import VehicleDetailsModal from '../modals/vehicle-details-modal';
import { cn } from '@/lib/utils';

interface AlertGroupProps {
  type: 'maintenance' | 'licensing';
  vehicles: Vehicle[];
  companyId: CompanyId;
  allVehicles: Vehicle[];
  groups: Group[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id'>) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
}

const ALERT_CONFIG = {
  maintenance: {
    title: 'Alertas de Manutenção',
    icon: Wrench,
    color: 'text-yellow-500',
    borderColor: 'border-yellow-500',
  },
  licensing: {
    title: 'Alertas de Licenciamento',
    icon: FileBadge,
    color: 'text-orange-500',
    borderColor: 'border-orange-500',
  },
};

export default function AlertGroup({ 
  type,
  vehicles, 
  companyId, 
  allVehicles, 
  groups,
  onUpdateVehicle, 
  onAddVehicle,
  onAddGroup 
}: AlertGroupProps) {
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const openDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };
  
  const config = ALERT_CONFIG[type];
  const Icon = config.icon;

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <Card
            className={cn('bg-card rounded-xl shadow-sm border mb-4 overflow-hidden transition-all', config.borderColor)}
          >
            <AccordionTrigger className="p-4 bg-card hover:bg-muted/50 flex justify-between items-center cursor-pointer w-full">
              <div className="flex items-center">
                <Icon className={cn('mr-3 h-5 w-5', config.color)} />
                <h3 className="font-bold font-headline text-lg text-foreground">
                  {config.title} ({vehicles.length})
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-background">
              {vehicles.map((vehicle) => (
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
