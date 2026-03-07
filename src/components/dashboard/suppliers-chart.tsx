'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

interface SuppliersChartProps {
  data: Vehicle[];
}

export default function SuppliersChart({ data }: SuppliersChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = useMemo(() => {
    const supplierCosts: Record<string, number> = {};

    data.forEach(vehicle => {
      vehicle.maintenances?.forEach(maint => {
        const fornecedor = (maint.fornecedor || 'Sem fornecedor').trim();
        supplierCosts[fornecedor] = (supplierCosts[fornecedor] || 0) + (maint.total || 0);
      });
    });

    return Object.entries(supplierCosts)
      .map(([name, Custo]) => ({ name, Custo }))
      .sort((a, b) => b.Custo - a.Custo)
      .slice(0, 5);
  }, [data]);

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">
          Top Fornecedores
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={110} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="Custo" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} barSize={30} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}