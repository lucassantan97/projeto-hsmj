'use server';
/**
 * @fileOverview An AI agent that analyzes vehicle maintenance history.
 *
 * - analyzeMaintenanceHistory - A function that handles the maintenance analysis process.
 * - MaintenanceAnalysisInput - The input type for the analyzeMaintenanceHistory function.
 * - MaintenanceAnalysisOutput - The return type for the analyzeMaintenanceHistory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const MaintenanceAnalysisInputSchema = z.object({
    vehicleModel: z.string(),
    maintenances: z.array(z.object({
      data: z.string(),
      km: z.number(),
      total: z.number(),
      items: z.array(z.object({ descricao: z.string(), valor: z.number() })),
    })),
  });
export type MaintenanceAnalysisInput = z.infer<typeof MaintenanceAnalysisInputSchema>;

export const MaintenanceAnalysisOutputSchema = z.object({
    analysis: z.string().describe("A brief, insightful analysis of the vehicle's maintenance history, pointing out patterns, potential future issues, and overall health. Use Markdown for formatting."),
});
export type MaintenanceAnalysisOutput = z.infer<typeof MaintenanceAnalysisOutputSchema>;


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

const analyzeMaintenanceHistoryFlow = ai.defineFlow(
    {
        name: 'analyzeMaintenanceHistoryFlow',
        inputSchema: MaintenanceAnalysisInputSchema,
        outputSchema: MaintenanceAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await analysisPrompt(input);
        if (!output) {
            throw new Error('Analysis prompt failed to produce output.');
        }
        return output;
    }
);

export async function analyzeMaintenanceHistory(input: MaintenanceAnalysisInput): Promise<MaintenanceAnalysisOutput> {
    return analyzeMaintenanceHistoryFlow(input);
}
