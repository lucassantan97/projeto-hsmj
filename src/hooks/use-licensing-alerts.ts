
'use client';
import { useState, useEffect } from 'react';
import type { Vehicle, LicensingAlert } from '@/lib/types';
import { getLicensingInfo } from '@/lib/utils';

export function useLicensingAlerts(vehicles: Vehicle[]): LicensingAlert[] {
  const [alerts, setAlerts] = useState<LicensingAlert[]>([]);

  useEffect(() => {
    const generatedAlerts: LicensingAlert[] = [];

    vehicles.forEach((vehicle) => {
      if (vehicle.status !== 'ativo') return;
      
      let info;
      // If a specific licensing date is set, use it to calculate status
      if (vehicle.licenciamento) {
        const licDate = new Date(vehicle.licenciamento);
        // We need to pass the year of the stored date to getLicensingInfo for a correct calculation basis.
        info = getLicensingInfo(vehicle.placa, licDate.getUTCFullYear());

        // Now, we need to manually override the status based on the *actual stored date*
        const today = new Date();
        today.setHours(0,0,0,0);
        const daysRemaining = Math.ceil((licDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        info.daysRemaining = daysRemaining;
        if (daysRemaining < 0) {
          info.status = 'vencido';
        } else if (daysRemaining <= 30) {
          info.status = 'alerta';
        } else {
          info.status = 'ok';
        }
        info.dueDate = licDate;

      } else {
        // If no specific date, calculate based on current year
        info = getLicensingInfo(vehicle.placa);
      }


      if (info.status === 'vencido' || info.status === 'alerta') {
        generatedAlerts.push({
          vehicleId: vehicle.id,
          dueDate: info.dueDate.toISOString(),
          daysRemaining: info.daysRemaining,
          status: info.status,
        });
      }
    });

    // Sort alerts: expired first, then by due date
    const sortedAlerts = generatedAlerts.sort((a, b) => {
      if (a.status === 'vencido' && b.status !== 'vencido') return -1;
      if (a.status !== 'vencido' && b.status === 'vencido') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setAlerts(sortedAlerts);
  }, [vehicles]);

  return alerts;
}
