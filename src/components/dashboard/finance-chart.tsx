'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

interface FinanceChartProps {
  data: Vehicle[];
}

export default function FinanceChart({ data }: FinanceChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: { [key: number]: { revenue: number; maintenance: number } } = {};

    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { revenue: 0, maintenance: 0 };
    }

    data.forEach(vehicle => {
      if (vehicle.vendaInfo) {
        const month = new Date(vehicle.vendaInfo.dataVenda).getMonth();
        monthlyData[month].revenue += vehicle.vendaInfo.valorVenda;
      }
      vehicle.maintenances?.forEach(maint => {
        const month = new Date(maint.data).getMonth();
        monthlyData[month].maintenance += maint.total;
      });
    });

    return Object.keys(monthlyData).map(monthKey => ({
      name: new Date(2000, Number(monthKey), 1).toLocaleString('default', { month: 'short' }),
      Receita: monthlyData[Number(monthKey)].revenue,
      Manutenção: monthlyData[Number(monthKey)].maintenance,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">Fluxo Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(Number(value) / 1000)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <Bar dataKey="Receita" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Manutenção" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
