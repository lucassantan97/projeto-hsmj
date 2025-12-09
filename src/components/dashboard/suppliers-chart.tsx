'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

interface SuppliersChartProps {
  data: Vehicle[];
}

export default function SuppliersChart({ data }: SuppliersChartProps) {
  const chartData = useMemo(() => {
    const supplierCosts: { [key: string]: number } = {};

    data.forEach(vehicle => {
      vehicle.maintenances?.forEach(maint => {
        supplierCosts[maint.fornecedor] = (supplierCosts[maint.fornecedor] || 0) + maint.total;
      });
    });

    return Object.entries(supplierCosts)
      .map(([name, Custo]) => ({ name, Custo }))
      .sort((a, b) => b.Custo - a.Custo)
      .slice(0, 5);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">Top Fornecedores</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="Custo" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
