
'use client';
import { useMemo } from 'react';
import type { Vehicle, LicensingAlert } from '@/lib/types';
import { getLicensingInfo } from '@/lib/utils';

export function useLicensingAlerts(vehicles: Vehicle[]): LicensingAlert[] {
  return useMemo(() => {
    const alerts: LicensingAlert[] = [];

    vehicles.forEach((vehicle) => {
      if (vehicle.status !== 'ativo') return;

      const currentYear = new Date().getFullYear();
      let yearToCheck = currentYear;
      
      // If vehicle has a licensing date, check if it's for the current year or future
      if (vehicle.licenciamento) {
        const licensiamentoYear = new Date(vehicle.licenciamento).getFullYear();
        if (licensiamentoYear >= currentYear) {
           // Already licensed for this year or a future year, so check for next year
           yearToCheck = licensiamentoYear + 1;
        }
      }

      const info = getLicensingInfo(vehicle.placa, yearToCheck);

      if (info.status === 'vencido' || info.status === 'alerta') {
        alerts.push({
          vehicleId: vehicle.id,
          dueDate: info.dueDate.toISOString(),
          daysRemaining: info.daysRemaining,
          status: info.status,
        });
      }
    });

    // Sort alerts: expired first, then by due date
    return alerts.sort((a, b) => {
      if (a.status === 'vencido' && b.status !== 'vencido') return -1;
      if (a.status !== 'vencido' && b.status === 'vencido') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [vehicles]);
}
