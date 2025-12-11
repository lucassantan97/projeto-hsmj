
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | undefined | null) {
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

// Calendário de licenciamento para Pessoa Jurídica (exemplo para SP, pode ser ajustado)
const anpLicensingSchedule: { [key: string]: number } = {
  '1': 4, // Final 1 e 2: vencimento em Abril
  '2': 4,
  '3': 5, // Final 3 e 4: vencimento em Maio
  '4': 5,
  '5': 6, // Final 5 e 6: vencimento em Junho
  '6': 6,
  '7': 7, // Final 7: vencimento em Julho
  '8': 8, // Final 8: vencimento em Agosto
  '9': 9, // Final 9: vencimento em Setembro
  '0': 10, // Final 0: vencimento em Outubro
};

export function getLicensingInfo(placa: string, year?: number) {
  const currentYear = year || new Date().getFullYear();
  const lastDigit = placa.slice(-1);
  const dueMonth = anpLicensingSchedule[lastDigit] || 4; // Default to April if not found

  // Vencimento é no último dia útil do mês
  let dueDate = new Date(currentYear, dueMonth, 0); // Last day of the month
  while (dueDate.getDay() === 0 || dueDate.getDay() === 6) {
    dueDate.setDate(dueDate.getDate() - 1);
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const daysRemaining = differenceInDays(dueDate, today);

  let status: 'vencido' | 'alerta' | 'ok' = 'ok';
  if (daysRemaining < 0) {
    status = 'vencido';
  } else if (daysRemaining <= 30) {
    status = 'alerta';
  }

  return {
    dueDate,
    daysRemaining,
    status,
  };
}
