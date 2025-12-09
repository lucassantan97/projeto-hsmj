// This file is machine-generated - edit at your own risk.
'use server';
/**
 * @fileOverview An AI agent that extracts data from maintenance receipts.
 *
 * - maintenanceReceiptDataExtraction - A function that handles the data extraction process.
 * - MaintenanceReceiptDataExtractionInput - The input type for the maintenanceReceiptDataExtraction function.
 * - MaintenanceReceiptDataExtractionOutput - The return type for the maintenanceReceiptDataExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaintenanceReceiptDataExtractionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a maintenance receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MaintenanceReceiptDataExtractionInput = z.infer<typeof MaintenanceReceiptDataExtractionInputSchema>;

const MaintenanceReceiptDataExtractionOutputSchema = z.object({
  date: z.string().describe('The date of the maintenance in YYYY-MM-DD format.'),
  km: z.number().describe('The current KM of the vehicle at the time of maintenance.'),
  fornecedor: z.string().describe('The name of the maintenance provider.'),
  items: z.array(z.string()).describe('An array of maintenance item descriptions.'),
  total: z.number().describe('The total cost of the maintenance.'),
});
export type MaintenanceReceiptDataExtractionOutput = z.infer<typeof MaintenanceReceiptDataExtractionOutputSchema>;

export async function maintenanceReceiptDataExtraction(input: MaintenanceReceiptDataExtractionInput): Promise<MaintenanceReceiptDataExtractionOutput> {
  return maintenanceReceiptDataExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maintenanceReceiptDataExtractionPrompt',
  input: {schema: MaintenanceReceiptDataExtractionInputSchema},
  output: {schema: MaintenanceReceiptDataExtractionOutputSchema},
  prompt: `You are an AI assistant that extracts data from maintenance receipts.

  Analyze the following maintenance receipt image and extract the following information:
  - Date of maintenance (YYYY-MM-DD)
  - Current KM of the vehicle
  - Name of the maintenance provider
  - A list of maintenance items
  - Total cost of maintenance

  Return the information as a JSON object.
  Here is the receipt:
  {{media url=photoDataUri}}
  Ensure that the outputted JSON is parsable.
  `,
});

const maintenanceReceiptDataExtractionFlow = ai.defineFlow(
  {
    name: 'maintenanceReceiptDataExtractionFlow',
    inputSchema: MaintenanceReceiptDataExtractionInputSchema,
    outputSchema: MaintenanceReceiptDataExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
