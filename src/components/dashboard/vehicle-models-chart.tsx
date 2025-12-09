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
        // Normalize the model name: lowercase and trim whitespace
        const normalizedModel = vehicle.modelo.trim().toLowerCase();
        modelCounts[normalizedModel] = (modelCounts[normalizedModel] || 0) + 1;
      }
    });

    // Capitalize the first letter of each word for display
    const formattedData = Object.entries(modelCounts).map(([name, Quantidade]) => ({
      name: name.replace(/\b\w/g, char => char.toUpperCase()),
      Quantidade,
    }));

    return formattedData.sort((a, b) => b.Quantidade - a.Quantidade);
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
