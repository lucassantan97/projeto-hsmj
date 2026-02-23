'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { History } from 'lucide-react';
import type { Vehicle, CompanyId, Group } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import VehicleDetailsModal from '../modals/vehicle-details-modal';

interface SoldFleetViewProps {
  vehicles: Vehicle[];
  companyId: CompanyId;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  groups: Group[];
  onAddVehicle: (vehicleData: Omit<Vehicle, 'id' | 'ownerUserId'>) => void;
  onAddGroup: (group: Omit<Group, 'id' | 'ownerUserId' | 'order'>) => void;
}

export default function SoldFleetView({ vehicles, companyId, onUpdateVehicle, groups, onAddVehicle, onAddGroup }: SoldFleetViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

  const soldVehicles = vehicles
    .filter((v) => v.status === 'vendido' && v.vendaInfo) // Ensure vendaInfo exists
    .sort((a, b) => new Date(b.vendaInfo!.dataVenda).getTime() - new Date(a.vendaInfo!.dataVenda).getTime());

  const openDetailsModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <History className="text-muted-foreground" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Clique em um veículo para ver detalhes históricos.
          </p>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2 pr-4">
              {soldVehicles.length > 0 ? (
                soldVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => openDetailsModal(v)}
                    className="border p-3 rounded-lg bg-background hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold">{v.placa} - {v.modelo}</p>
                            <p className="text-xs text-muted-foreground">Vendido em: {v.vendaInfo ? new Date(v.vendaInfo.dataVenda).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(v.vendaInfo?.valorVenda)}</p>
                            <p className="text-xs text-muted-foreground">Comprador: {v.vendaInfo?.comprador}</p>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Nenhum veículo vendido encontrado.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {selectedVehicle && (
        <VehicleDetailsModal
          isOpen={isDetailsModalOpen}
          setIsOpen={setDetailsModalOpen}
          vehicle={selectedVehicle}
          allVehicles={vehicles}
          companyId={companyId}
          onUpdateVehicle={onUpdateVehicle}
          groups={groups}
          onAddVehicle={onAddVehicle}
          onAddGroup={onAddGroup}
        />
      )}
    </>
  );
}
