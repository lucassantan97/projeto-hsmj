'use server';

import { generateSalesAd } from '@/ai/flows/generate-sales-ad';
import { maintenanceReceiptDataExtraction } from '@/ai/flows/maintenance-receipt-data-extraction';
import { z } from 'zod';
import type { Vehicle } from './types';
import { ai } from '@/ai/genkit';

export async function generateSalesAdAction(vehicle: Vehicle) {
  try {
    const result = await generateSalesAd({
      modelo: vehicle.modelo,
      anoModelo: vehicle.anoModelo,
      valorVenda: vehicle.vendaInfo?.valorVenda || vehicle.valorCompra,
      placa: vehicle.placa,
      additionalDetails: `Veículo da empresa ${vehicle.empresa}, com ${vehicle.totalMaint ? vehicle.totalMaint.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '0'} em manutenções.`,
    });
    return { success: true, ad: result.salesAd };
  } catch (error) {
    console.error('Error generating sales ad:', error);
    return { success: false, error: 'Failed to generate sales ad.' };
  }
}


export async function extractMaintenanceDataAction(photoDataUri: string) {
    if (!photoDataUri) {
        return { success: false, error: 'No photo data provided.' };
    }
    try {
        const result = await maintenanceReceiptDataExtraction({ photoDataUri });
        return { success: true, data: result };
    } catch (error) {
        console.error('Error extracting maintenance data:', error);
        return { success: false, error: 'Failed to extract data from receipt.' };
    }
}


const MaintenanceAnalysisInputSchema = z.object({
  vehicleModel: z.string(),
  maintenances: z.array(z.object({
    data: z.string(),
    km: z.number(),
    total: z.number(),
    items: z.array(z.object({ descricao: z.string(), valor: z.number() })),
  })),
});

const MaintenanceAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A brief, insightful analysis of the vehicle's maintenance history, pointing out patterns, potential future issues, and overall health. Use Markdown for formatting."),
});

const analysisPrompt = ai.definePrompt({
  name: 'maintenanceAnalysisPrompt',
  input: { schema: MaintenanceAnalysisInputSchema },
  output: { schema: MaintenanceAnalysisOutputSchema },
  prompt: `You are a specialist mechanic and data analyst. Based on the maintenance history of a {{vehicleModel}}, provide a concise analysis.

- Point out any recurring issues.
- Suggest potential future maintenance needs based on the history and mileage.
- Give an overall assessment of the vehicle's maintenance status.
- Be brief and use bullet points (Markdown).
- Write in Portuguese.

History:
{{jsonStringify maintenances}}
`,
});

export async function analyzeMaintenanceHistoryAction(input: z.infer<typeof MaintenanceAnalysisInputSchema>) {
    try {
        const { output } = await analysisPrompt(input);
        return { success: true, analysis: output?.analysis };
    } catch (error) {
        console.error('Error analyzing maintenance history:', error);
        return { success: false, error: 'Failed to analyze history.' };
    }
}
