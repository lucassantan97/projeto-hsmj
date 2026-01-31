
'use client';
import { useState, useEffect } from 'react';
import type { Vehicle, MaintenanceAlert } from '@/lib/types';
import { differenceInMonths, differenceInDays } from 'date-fns';

const KM_INTERVAL = 10000;
const TIME_INTERVAL_MONTHS = 12;
const TIME_WARNING_MONTHS = 11;

export function useMaintenanceAlerts(vehicles: Vehicle[]): MaintenanceAlert[] {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);

  useEffect(() => {
    const generatedAlerts: MaintenanceAlert[] = [];
    const today = new Date();

    vehicles.forEach((vehicle) => {
      if (vehicle.status !== 'ativo') return;

      const sortedMaintenances = vehicle.maintenances 
        ? [...vehicle.maintenances].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        : [];
      
      const lastMaintenance = sortedMaintenances[0];
      const lastKm = lastMaintenance?.km ?? 0;
      const lastDate = lastMaintenance ? new Date(lastMaintenance.data) : (vehicle.dataEntrada ? new Date(vehicle.dataEntrada) : null);
      const currentKm = vehicle.kmAtual ?? lastKm;

      // 1. Check KM-based alert
      if (currentKm > lastKm + KM_INTERVAL) {
        generatedAlerts.push({
          vehicleId: vehicle.id,
          type: 'km',
          message: `Revisão de ${lastKm + KM_INTERVAL} km pendente. KM atual: ${currentKm.toLocaleString('pt-BR')}.`,
        });
      }
      
      // 2. Check Time-based alert
      if (lastDate) {
        const monthsSinceLastService = differenceInMonths(today, lastDate);
        if (monthsSinceLastService >= TIME_WARNING_MONTHS) {
            const isDue = monthsSinceLastService >= TIME_INTERVAL_MONTHS;
            const dueDate = new Date(lastDate);
            dueDate.setMonth(dueDate.getMonth() + TIME_INTERVAL_MONTHS);
            const daysOverdue = isDue ? differenceInDays(today, dueDate) : 0;
            
            generatedAlerts.push({
                vehicleId: vehicle.id,
                type: 'time',
                message: isDue 
                    ? `Revisão anual vencida há ${daysOverdue} dia(s).` 
                    : 'Revisão anual vencerá em menos de um mês.',
            });
        }
      }
    });

    setAlerts(generatedAlerts);
  }, [vehicles]);

  return alerts;
}
