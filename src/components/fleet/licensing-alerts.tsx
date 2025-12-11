
'use client';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileBadge } from 'lucide-react';
import type { LicensingAlert, Vehicle } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LicensingAlertsProps {
  alerts: LicensingAlert[];
  findVehicleById: (id: string) => Vehicle | undefined;
}

const LicensingAlerts: React.FC<LicensingAlertsProps> = ({ alerts, findVehicleById }) => {
    if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert) => {
        const vehicle = findVehicleById(alert.vehicleId);
        const isExpired = alert.status === 'vencido';

        const alertClasses = isExpired 
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
        
        const iconColor = isExpired ? '!text-red-500' : '!text-orange-500';

        const message = isExpired
            ? `Licenciamento vencido desde ${new Date(alert.dueDate).toLocaleDateString('pt-BR')}.`
            : `Licenciamento vence em ${alert.daysRemaining} dia(s) (${new Date(alert.dueDate).toLocaleDateString('pt-BR')}).`;


        return (
          <Alert key={`lic-${alert.vehicleId}`} variant={isExpired ? 'destructive' : 'default'} className={cn(alertClasses)}>
            <FileBadge className={cn('h-4 w-4', iconColor)} />
            <AlertTitle className="font-bold">
              Alerta de Licenciamento: {vehicle?.placa} ({vehicle?.modelo})
            </AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        );
      })}
    </>
  );
};

export default LicensingAlerts;
