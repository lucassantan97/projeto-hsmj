'use client';

import React, { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';

interface SalesChartProps {
  data: Vehicle[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = useMemo(() => {
    const monthlySales: { [key: number]: number } = {};

    for (let i = 0; i < 12; i++) {
      monthlySales[i] = 0;
    }

    data.forEach(vehicle => {
      if (vehicle.status === 'vendido' && vehicle.vendaInfo) {
        const month = new Date(vehicle.vendaInfo.dataVenda).getMonth();
        monthlySales[month]++;
      }
    });

    return Object.keys(monthlySales).map(monthKey => ({
      name: new Date(2000, Number(monthKey), 1).toLocaleString('default', { month: 'short' }),
      Vendas: monthlySales[Number(monthKey)],
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">Evolução de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Line type="monotone" dataKey="Vendas" stroke="hsl(var(--chart-1))" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
