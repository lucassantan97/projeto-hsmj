'use server';

import { generateSalesAd } from '@/ai/flows/generate-sales-ad';
import { maintenanceReceiptDataExtraction } from '@/ai/flows/maintenance-receipt-data-extraction';
import { analyzeMaintenanceHistory, MaintenanceAnalysisInputSchema } from '@/ai/flows/analyze-maintenance-history';
import { z } from 'zod';
import type { Vehicle } from './types';
import { ask, type ChatInput } from '@/ai/flows/chat-flow';

export async function generateSalesAdAction(vehicle: Vehicle) {
  try {
    const result = await generateSalesAd({
      modelo: vehicle.modelo,
      anoModelo: vehicle.anoModelo,
      valorVenda: vehicle.vendaInfo?.valorVenda || vehicle.valorCompra,
      placa: vehicle.placa,
      additionalDetails: `Veículo da empresa ${vehicle.empresa}.`,
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

export async function analyzeMaintenanceHistoryAction(input: z.infer<typeof MaintenanceAnalysisInputSchema>) {
    try {
        const result = await analyzeMaintenanceHistory(input);
        return { success: true, analysis: result.analysis };
    } catch (error) {
        console.error('Error analyzing maintenance history:', error);
        return { success: false, error: 'Failed to analyze history.' };
    }
}

export async function chatAction(input: ChatInput) {
    try {
        const result = await ask(input);
        return { success: true, answer: result.answer };
    } catch (error) {
        console.error('Error in chat action:', error);
        return { success: false, error: 'Failed to get a response from the AI.' };
    }
}
