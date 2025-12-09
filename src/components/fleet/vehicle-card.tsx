'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { COMPANIES } from '@/lib/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
  className?: string;
}

export default function VehicleCard({ vehicle, onClick, className }: VehicleCardProps) {
  const companyTheme = COMPANIES[vehicle.empresa].theme.primary;
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', vehicle.id);
  };

  return (
    <Card
      className={cn("hover:shadow-md cursor-pointer relative border-l-4", `border-${companyTheme}`, className)}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
        <CardTitle className="text-lg font-bold font-headline">{vehicle.placa}</CardTitle>
        <Badge variant="outline" className="text-xs">{vehicle.anoModelo}</Badge>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-sm text-muted-foreground truncate">{vehicle.modelo}</p>
      </CardContent>
    </Card>
  );
}
