'use client';

import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import KpiCard from './kpi-card';
import FinanceChart from './finance-chart';
import SalesChart from './sales-chart';
import SuppliersChart from './suppliers-chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { Card, CardHeader, CardTitle } from '../ui/card';
import VehicleModelsChart from './vehicle-models-chart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface BiDashboardProps {
  vehicles: Vehicle[];
}

/**
 * Converte vários formatos possíveis em Date de forma segura.
 * - Aceita Firestore Timestamp (toDate)
 * - Aceita ISO string "YYYY-MM-DD" (seu caso em dataEntrada)
 * - Aceita Date
 * - Retorna null se inválido
 */
function toDate(value: any): Date | null {
  if (!value) return null;

  // Firestore Timestamp
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }

  // Date
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime()) ? value : null;
  }

  // String ISO ou compatível
  if (typeof value === 'string') {
    // Seu formato: "2017-06-13" => seguro
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // number (timestamp ms) ou outros
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function BiDashboard({ vehicles }: BiDashboardProps) {
  const { toast } = useToast();
  const [year, setYear] = useState<string | undefined>(undefined);
  const [month, setMonth] = useState('all');

  // define o ano inicial no client (evita mismatch)
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  /**
   * ✅ LISTA DE ANOS:
   * compra = dataEntrada
   * venda  = vendaInfo.dataVenda
   * manut  = maintenances[].data
   */
  const years = useMemo(() => {
    const allYears = new Set<number>();

    if (year) allYears.add(parseInt(year, 10));

    vehicles.forEach((v) => {
      // COMPRA (dataEntrada)
      const compra = toDate((v as any).dataEntrada);
      if (compra) allYears.add(compra.getFullYear());

      // VENDA
      const venda = toDate(v.vendaInfo?.dataVenda);
      if (venda) allYears.add(venda.getFullYear());

      // MANUTENÇÕES
      v.maintenances?.forEach((m) => {
        const md = toDate(m.data);
        if (md) allYears.add(md.getFullYear());
      });
    });

    return Array.from(allYears).sort((a, b) => b - a);
  }, [vehicles, year]);

  /**
   * ✅ DADOS FILTRADOS POR PERÍODO:
   * - manutenções filtradas por year+month
   * - venda filtrada por year+month
   * - (opcional) informação se a compra cai no período
   *
   * Obs: FinanceChart pode usar dataEntrada diretamente; aqui a gente
   * só garante consistência do que entra no dashboard.
   */
  const filteredData = useMemo(() => {
    if (!year) return [];

    const yearNum = parseInt(year, 10);
    const monthNum = month === 'all' ? null : parseInt(month, 10);

    return vehicles.map((v) => {
      const filteredMaintenances =
        v.maintenances?.filter((m) => {
          const d = toDate(m.data);
          if (!d) return false;
          const yearMatch = d.getFullYear() === yearNum;
          const monthMatch = monthNum === null || d.getMonth() === monthNum;
          return yearMatch && monthMatch;
        }) || [];

      let filteredSale: any = null;
      if (v.vendaInfo) {
        const d = toDate(v.vendaInfo.dataVenda);
        if (d) {
          const yearMatch = d.getFullYear() === yearNum;
          const monthMatch = monthNum === null || d.getMonth() === monthNum;
          if (yearMatch && monthMatch) filteredSale = v.vendaInfo;
        }
      }

      // Compra no período (pela dataEntrada)
      const compraDate = toDate((v as any).dataEntrada);
      const compraNoPeriodo =
        !!compraDate &&
        compraDate.getFullYear() === yearNum &&
        (monthNum === null || compraDate.getMonth() === monthNum);

      return {
        ...v,
        maintenances: filteredMaintenances,
        vendaInfo: filteredSale,
        compraNoPeriodo,
      };
    });
  }, [vehicles, year, month]);

  // Patrimônio atual (frota ativa)
  const totalAssets = vehicles
    .filter((v) => v.status === 'ativo')
    .reduce((acc, v) => acc + (v.valorCompra || 0), 0);

  // Receita vendas (período)
  const totalRevenue = filteredData
    .filter((v) => v.status === 'vendido' && v.vendaInfo)
    .reduce((acc, v) => acc + (v.vendaInfo?.valorVenda || 0), 0);

  const salesCount = filteredData.filter((v) => v.status === 'vendido' && v.vendaInfo).length;

  // Custo manutenção (período)
  const totalMaintenance = filteredData.reduce(
    (acc, v) => acc + (v.maintenances?.reduce((mAcc, m) => mAcc + (m.total || 0), 0) || 0),
    0
  );

  const generateDashboardPDF = () => {
    if (!year) return;
    const doc = new jsPDF();

    const monthName =
      month === 'all'
        ? 'Todo o Ano'
        : new Date(2000, parseInt(month, 10), 1).toLocaleString('pt-BR', { month: 'long' });

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
    doc.text('Relatório gerado pelo sistema FleetWise AI.', 14, (doc as any).lastAutoTable.finalY + 20);

    doc.save(`Relatorio_BI_${year}_${monthName.replace(' ', '_')}.pdf`);
  };

  if (!year) {
    return (
      <section className="space-y-6">
        <Card className="border-l-4 border-foreground">
          <CardHeader>
            <Skeleton className="h-12 w-full" />
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </section>
    );
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
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full md:w-48 font-bold">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o Ano</SelectItem>
                {[
                  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
                ].map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 hover:text-green-800"
                onClick={() =>
                  toast({
                    title: 'Função em desenvolvimento',
                    description: 'A exportação para Excel será implementada em breve.',
                  })
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 hover:text-red-800"
                onClick={generateDashboardPDF}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div id="dashboard-print-area" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Patrimônio Atual" value={totalAssets} />
          <KpiCard
            title="Receita Vendas (Período)"
            value={totalRevenue}
            description={`${salesCount} vendidos`}
            color="green"
          />
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