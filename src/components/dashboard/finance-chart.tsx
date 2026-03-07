'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

interface FinanceChartProps {
  data: Vehicle[];
}

function safeDate(value: any): Date | null {
  if (!value) return null;

  // Firestore Timestamp
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }

  // String no formato brasileiro DD/MM/YYYY
  if (typeof value === 'string' && value.includes('/')) {
    const [day, month, year] = value.split('/');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // ISO / Date / number
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function FinanceChart({ data }: FinanceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const monthlyData: Record<
      number,
      { revenue: number; maintenance: number; purchases: number }
    > = {};

    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { revenue: 0, maintenance: 0, purchases: 0 };
    }

    data.forEach((vehicle) => {
      // ✅ COMPRAS: usa dataEntrada (Firestore tem "2017-06-13")
      const compraDate = safeDate((vehicle as any).dataEntrada);
      if (compraDate) {
        const month = compraDate.getMonth();
        monthlyData[month].purchases += Number(vehicle.valorCompra || 0);
      }

      // ✅ RECEITA: venda
      if (vehicle.vendaInfo) {
        const vendaDate = safeDate(vehicle.vendaInfo.dataVenda);
        if (vendaDate) {
          const month = vendaDate.getMonth();
          monthlyData[month].revenue += Number(vehicle.vendaInfo.valorVenda || 0);
        }
      }

      // ✅ MANUTENÇÃO
      vehicle.maintenances?.forEach((maint) => {
        const maintDate = safeDate(maint.data);
        if (!maintDate) return;
        const month = maintDate.getMonth();
        monthlyData[month].maintenance += Number(maint.total || 0);
      });
    });

    return Object.keys(monthlyData).map((monthKey) => ({
      name: new Date(2000, Number(monthKey), 1).toLocaleString('pt-BR', {
        month: 'short',
      }),
      Compras: monthlyData[Number(monthKey)].purchases,
      Receita: monthlyData[Number(monthKey)].revenue,
      Manutenção: monthlyData[Number(monthKey)].maintenance,
    }));
  }, [data]);

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm uppercase font-bold text-muted-foreground font-headline">
          Fluxo Financeiro
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />

            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${formatCurrency(Number(value) / 1000)}k`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => formatCurrency(Number(value))}
            />

            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* ✅ Compras */}
            <Bar
              dataKey="Compras"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />

            {/* ✅ Receita */}
            <Bar
              dataKey="Receita"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />

            {/* ✅ Manutenção */}
            <Bar
              dataKey="Manutenção"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}