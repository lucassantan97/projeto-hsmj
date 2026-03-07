'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
        const normalizedModel = (vehicle.modelo || '').trim().toLowerCase();
        if (!normalizedModel) return;
        modelCounts[normalizedModel] = (modelCounts[normalizedModel] || 0) + 1;
      }
    });

    return Object.entries(modelCounts)
      .map(([name, Quantidade]) => ({
        name: name.replace(/\b\w/g, char => char.toUpperCase()),
        Quantidade,
      }))
      .sort((a, b) => b.Quantidade - a.Quantidade);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">
          Modelos na Frota Ativa
        </CardTitle>
      </CardHeader>

      {/* Removi h-80 e usei altura fixa no ResponsiveContainer */}
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar
              dataKey="Quantidade"
              fill="hsl(var(--chart-5))"
              radius={[4, 4, 0, 0]}
              barSize={40}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
