'use client';

import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import KpiCard from './kpi-card';
import FinanceChart from './finance-chart';
import SalesChart from './sales-chart';
import SuppliersChart from './suppliers-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import VehicleModelsChart from './vehicle-models-chart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface BiDashboardProps {
  vehicles: Vehicle[];
}

export default function BiDashboard({ vehicles }: BiDashboardProps) {
  const { toast } = useToast();
  const [year, setYear] = useState<string | undefined>(undefined);
  const [month, setMonth] = useState('all');

  // Set the initial year on the client side to prevent hydration mismatch.
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const years = useMemo(() => {
    const allYears = new Set<number>();
    // Add current year if it's set
    if (year) {
      allYears.add(parseInt(year, 10));
    }
    
    // Scan all data for other relevant years
    vehicles.forEach(v => {
      if (v.dataEntrada) allYears.add(new Date(v.dataEntrada).getFullYear());
      if (v.vendaInfo?.dataVenda) allYears.add(new Date(v.vendaInfo.dataVenda).getFullYear());
      v.maintenances?.forEach(m => allYears.add(new Date(m.data).getFullYear()));
    });

    // Return a sorted array of unique years
    return Array.from(allYears).sort((a, b) => b - a);
  }, [vehicles, year]);

  const filteredData = useMemo(() => {
    if (!year) return []; // Guard against null year during initial render

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
        vendaInfo: filteredSale,
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

  const generateDashboardPDF = () => {
    if (!year) return;
    const doc = new jsPDF();
    const monthName = month === 'all' ? 'Todo o Ano' : new Date(2000, parseInt(month), 1).toLocaleString('pt-BR', { month: 'long' });
    const period = `${monthName} de ${year}`;
    
    doc.setFontSize(18);
    doc.text(`Relatório BI - ${period}`, 14, 22);
    doc.setFontSize(12);
    
    const kpiData = [
      ['Patrimônio Atual (Total da Frota)', formatCurrency(totalAssets)],
      [`Receita de Vendas (${period})`, `${formatCurrency(totalRevenue)} (${salesCount} vendidos)`],
      [`Custo de Manutenção (${period})`, formatCurrency(totalMaintenance)],
    ];

    (doc as any).autoTable({
      startY: 30,
      head: [['Indicador', 'Valor']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Relatório gerado pelo sistema FleetWise AI.", 14, (doc as any).lastAutoTable.finalY + 20);

    doc.save(`Relatorio_BI_${year}_${monthName.replace(' ', '_')}.pdf`);
  };

  // Show a skeleton loader while waiting for the client-side to set the year.
  if (!year) {
    return (
      <section className="space-y-6">
        <Card className="border-l-4 border-foreground"><CardHeader><Skeleton className="h-12 w-full" /></CardHeader></Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-80 w-full" /><Skeleton className="h-80 w-full" /></div>
        <Skeleton className="h-96 w-full" />
      </section>
    )
  }

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
                    <Button variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 hover:text-green-800" onClick={() => toast({ title: 'Função em desenvolvimento', description: 'A exportação para Excel será implementada em breve.' })}>
                        <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 hover:text-red-800" onClick={generateDashboardPDF}>
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div id="dashboard-print-area" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Patrimônio Atual" value={totalAssets} />
          <KpiCard title="Receita Vendas (Período)" value={totalRevenue} description={`${salesCount} vendidos`} color="green" />
          <KpiCard title="Custo Manutenção" value={totalMaintenance} color="red" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinanceChart data={filteredData} />
          <SalesChart data={filteredData} />
        </div>
        <SuppliersChart data={filteredData} />
        <VehicleModelsChart data={vehicles} />
      </div>
    </section>
  );
}
