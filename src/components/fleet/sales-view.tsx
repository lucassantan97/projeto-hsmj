'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import type { Vehicle, Sale, CompanyId } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import SellVehicleModal from '../modals/sell-vehicle-modal';
import ManagePhotosModal from '../modals/manage-photos-modal';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Camera, Handshake, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';
import { COMPANIES } from '@/lib/types';

interface SalesViewProps {
  vehicles: Vehicle[];
  companyId: CompanyId;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const SalesVehicleCard = ({ vehicle, onRegisterSale, onManagePhotos }: { vehicle: Vehicle, onRegisterSale: (vehicle: Vehicle) => void, onManagePhotos: (vehicle: Vehicle) => void }) => {
  const companyTheme = COMPANIES[vehicle.empresa].theme.primary;
  
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="relative aspect-video w-full">
        <Image 
          src={vehicle.photos?.[0] || 'https://picsum.photos/seed/carSalePlaceholder/600/400'}
          alt={vehicle.modelo}
          fill
          className="object-cover"
          data-ai-hint="car side"
        />
        <Badge variant="secondary" className="absolute top-2 left-2">{vehicle.anoModelo}</Badge>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-headline font-bold text-lg">{vehicle.placa}</h3>
        <p className="text-muted-foreground text-sm mb-4">{vehicle.modelo}</p>

        <div className="mt-auto space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">FIPE</span>
            <span className="font-bold">{formatCurrency(vehicle.fipeValue)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valor Sugerido</span>
            <span className={`font-bold text-lg text-${companyTheme}`}>{formatCurrency(vehicle.valorCompra * 1.1)}</span> 
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => onManagePhotos(vehicle)}>
                <Camera className="mr-2 h-4 w-4" /> Fotos ({vehicle.photos?.length || 0})
            </Button>
            <Button size="sm" onClick={() => onRegisterSale(vehicle)} className={`bg-${companyTheme} hover:bg-${companyTheme}/90`}>
                <Handshake className="mr-2 h-4 w-4" /> Registrar Venda
            </Button>
        </div>

      </CardContent>
    </Card>
  )
}

export default function SalesView({ vehicles, companyId, onUpdateVehicle }: SalesViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);

  const vehiclesForSale = vehicles.filter(v => v.forSale && v.status === 'ativo');

  const handleRegisterSaleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSellModalOpen(true);
  };
  
  const handleManagePhotosClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPhotoModalOpen(true);
  };

  const handleSold = (saleInfo: Sale) => {
    if (!selectedVehicle) return;
    onUpdateVehicle({ ...selectedVehicle, status: 'vendido', vendaInfo: saleInfo, forSale: false });
  };


  return (
    <>
      {vehiclesForSale.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {vehiclesForSale.map(v => (
            <SalesVehicleCard 
              key={v.id} 
              vehicle={v} 
              onRegisterSale={handleRegisterSaleClick} 
              onManagePhotos={handleManagePhotosClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed">
          <div className="bg-muted p-6 rounded-full mb-4">
            <Tag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Nenhum veículo anunciado
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Anuncie um veículo na ficha de detalhes para vê-lo aqui.
          </p>
        </div>
      )}

      <SellVehicleModal 
        isOpen={isSellModalOpen}
        setIsOpen={setSellModalOpen}
        vehicle={selectedVehicle}
        onSold={handleSold}
      />
      
      <ManagePhotosModal
        isOpen={isPhotoModalOpen}
        setIsOpen={setPhotoModalOpen}
        vehicle={selectedVehicle}
        onUpdateVehicle={onUpdateVehicle}
      />
    </>
  );
}
