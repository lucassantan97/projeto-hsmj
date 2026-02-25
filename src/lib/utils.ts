
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
  '1': 4, // Final 1: vencimento em Julho
  '2': 4,
  '3': 5, // Final 3: vencimento em Agosto
  '4': 5,
  '5': 6, // Final 5 e 6: vencimento em Setembro
  '6': 6,
  '7': 7, // Final 7: vencimento em Outubro
  '8': 8, // Final 8: vencimento em Novembro
  '9': 9, // Final 9: vencimento em Dezembro
  '0': 10, // Final 0: vencimento em Dezembro
};

export function getLicensingInfo(placa: string, referenceYear?: number) {
  const finalDigit = placa.slice(-1);
  if (!/^\d$/.test(finalDigit)) {
    // Return a default/error state if the last char is not a digit
    const today = new Date();
    return {
      dueDate: today,
      daysRemaining: 0,
      status: 'ok' as const,
    };
  }
  
  const currentYear = new Date().getFullYear();
  const year = referenceYear || currentYear;
  
  // Adjusted months based on common calendar (e.g. SP for companies)
  // Final 1: Jul, 2: Ago, 3: Set, 4: Out, 5/6: Nov, 7/8/9/0: Dez
  const schedule: { [key: string]: number } = {
    '1': 7, '2': 8, '3': 9, '4': 10, '5': 11, '6': 11, '7': 12, '8': 12, '9': 12, '0': 12,
  };

  const dueMonth = schedule[finalDigit]; 
  
  // Due date is last day of the month.
  let dueDate = new Date(year, dueMonth, 0); 
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If the calculated due date for the current year has already passed, calculate for next year.
  // This handles cases at the end of the year where the current year's deadline is gone.
  if (year === currentYear && today > dueDate) {
    dueDate = new Date(year + 1, dueMonth, 0);
  }

  const daysRemaining = differenceInDays(dueDate, today);

  let status: 'vencido' | 'alerta' | 'ok' = 'ok';
  // Use a different logic: if the due date is in the past, it's 'vencido'.
  if (today > dueDate) {
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
