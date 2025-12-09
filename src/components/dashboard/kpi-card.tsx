'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  description?: string;
  color?: 'blue' | 'green' | 'red';
}

export default function KpiCard({ title, value, description, color = 'blue' }: KpiCardProps) {
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
  }

  return (
    <Card className={cn('border-l-4', colorClasses[color])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-headline text-foreground">{formatCurrency(value)}</p>
        {description && <p className={cn('text-xs font-bold mt-2', textColorClasses[color])}>{description}</p>}
      </CardContent>
    </Card>
  );
}
