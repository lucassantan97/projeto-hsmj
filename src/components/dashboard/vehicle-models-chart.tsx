'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';

interface VehicleModelsChartProps {
  data: Vehicle[];
}

export default function VehicleModelsChart({ data }: VehicleModelsChartProps) {
  const chartData = useMemo(() => {
    const modelCounts: { [key: string]: number } = {};

    data.forEach(vehicle => {
      if (vehicle.status === 'ativo') {
        modelCounts[vehicle.modelo] = (modelCounts[vehicle.modelo] || 0) + 1;
      }
    });

    return Object.entries(modelCounts)
      .map(([name, Quantidade]) => ({ name, Quantidade }))
      .sort((a, b) => b.Quantidade - a.Quantidade);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">Modelos na Frota Ativa</CardTitle>
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
            />
            <Bar dataKey="Quantidade" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
