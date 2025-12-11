
'use client';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Wrench } from 'lucide-react';
import type { MaintenanceAlert, Vehicle } from '@/lib/types';

interface MaintenanceAlertsProps {
  alerts: MaintenanceAlert[];
  findVehicleById: (id: string) => Vehicle | undefined;
}

const MaintenanceAlerts: React.FC<MaintenanceAlertsProps> = ({ alerts, findVehicleById }) => {
  if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert) => {
        const vehicle = findVehicleById(alert.vehicleId);
        return (
          <Alert key={`maint-${alert.vehicleId}`} variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            <Wrench className="h-4 w-4 !text-yellow-500" />
            <AlertTitle className="font-bold">
              Alerta de Manutenção: {vehicle?.placa} ({vehicle?.modelo})
            </AlertTitle>
            <AlertDescription>
              {alert.message}
            </AlertDescription>
          </Alert>
        );
      })}
    </>
  );
};

export default MaintenanceAlerts;
