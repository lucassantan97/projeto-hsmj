'use client';

import React, { useState, useMemo } from 'react';
import KpiCard from './kpi-card';
import FinanceChart from './finance-chart';
import SalesChart from './sales-chart';
import SuppliersChart from './suppliers-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface BiDashboardProps {
  vehicles: Vehicle[];
}

export default function BiDashboard({ vehicles }: BiDashboardProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState('all');

  const years = useMemo(() => {
    const vehicleYears = vehicles.flatMap(v => [
      v.dataEntrada ? new Date(v.dataEntrada).getFullYear() : null,
      v.vendaInfo?.dataVenda ? new Date(v.vendaInfo.dataVenda).getFullYear() : null,
      ...(v.maintenances?.map(m => new Date(m.data).getFullYear()) || [])
    ]).filter(Boolean) as number[];
    return [...new Set([currentYear, ...vehicleYears])].sort().reverse();
  }, [vehicles, currentYear]);

  const filteredData = useMemo(() => {
    return vehicles.map(v => {
      const filteredMaintenances = v.maintenances?.filter(m => {
        const d = new Date(m.data);
        const yearMatch = d.getFullYear() === parseInt(year);
        const monthMatch = month === 'all' || d.getMonth() === parseInt(month);
        return yearMatch && monthMatch;
      }) || [];

      let filteredSale = null;
      if (v.vendaInfo) {
        const d = new Date(v.vendaInfo.dataVenda);
        const yearMatch = d.getFullYear() === parseInt(year);
        const monthMatch = month === 'all' || d.getMonth() === parseInt(month);
        if (yearMatch && monthMatch) {
          filteredSale = v.vendaInfo;
        }
      }

      return {
        ...v,
        maintenances: filteredMaintenances,
        vendaInfo: filteredSale, // This will be null if it doesn't match the filter
      };
    });
  }, [vehicles, year, month]);

  const totalAssets = vehicles
    .filter(v => v.status === 'ativo')
    .reduce((acc, v) => acc + v.valorCompra, 0);

  const totalRevenue = filteredData
    .filter(v => v.status === 'vendido' && v.vendaInfo)
    .reduce((acc, v) => acc + (v.vendaInfo?.valorVenda || 0), 0);
  
  const salesCount = filteredData.filter(v => v.status === 'vendido' && v.vendaInfo).length;

  const totalMaintenance = filteredData.reduce((acc, v) => 
    acc + (v.maintenances?.reduce((mAcc, m) => mAcc + m.total, 0) || 0), 0
  );

  return (
    <section className="space-y-6">
      <Card className="border-l-4 border-foreground">
        <CardHeader className="flex-col md:flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2 font-headline">
                <Filter className="text-muted-foreground" />
                Filtros do Período
            </CardTitle>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-full md:w-32 font-bold">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-full md:w-48 font-bold">
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo o Ano</SelectItem>
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                            <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 hover:text-green-800">
                        <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 hover:text-red-800">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div id="dashboard-print-area">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KpiCard title="Patrimônio Atual" value={totalAssets} />
          <KpiCard title="Receita Vendas (Período)" value={totalRevenue} description={`${salesCount} vendidos`} color="green" />
          <KpiCard title="Custo Manutenção" value={totalMaintenance} color="red" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FinanceChart data={filteredData} />
          <SalesChart data={filteredData} />
        </div>
        <SuppliersChart data={filteredData} />
      </div>
    </section>
  );
}
