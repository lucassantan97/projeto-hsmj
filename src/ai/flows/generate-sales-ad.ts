// src/ai/flows/generate-sales-ad.ts
'use server';

/**
 * @fileOverview Generates engaging sales ads based on vehicle data using AI.
 *
 * - generateSalesAd - A function that generates a sales ad for a vehicle.
 * - GenerateSalesAdInput - The input type for the generateSalesAd function.
 * - GenerateSalesAdOutput - The return type for the generateSalesAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSalesAdInputSchema = z.object({
  modelo: z.string().describe('The model of the vehicle.'),
  anoModelo: z.string().describe('The year and model of the vehicle.'),
  valorVenda: z.number().describe('The selling price of the vehicle.'),
  placa: z.string().describe('The license plate number of the vehicle.'),
  additionalDetails: z.string().optional().describe('Any additional details about the vehicle.'),
});
export type GenerateSalesAdInput = z.infer<typeof GenerateSalesAdInputSchema>;

const GenerateSalesAdOutputSchema = z.object({
  salesAd: z.string().describe('The generated sales advertisement text.'),
});
export type GenerateSalesAdOutput = z.infer<typeof GenerateSalesAdOutputSchema>;

export async function generateSalesAd(input: GenerateSalesAdInput): Promise<GenerateSalesAdOutput> {
  return generateSalesAdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSalesAdPrompt',
  input: {schema: GenerateSalesAdInputSchema},
  output: {schema: GenerateSalesAdOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in writing compelling sales ads for vehicles.

  Given the following vehicle details, generate a concise and engaging sales advertisement to attract potential buyers. Include key information like model, year, price, and any other provided details.

  Vehicle Model: {{{modelo}}}
  Year/Model: {{{anoModelo}}}
  Selling Price: R$ {{{valorVenda}}}
  License Plate: {{{placa}}}
  Additional Details: {{{additionalDetails}}}
  \nWrite in Portuguese.
  Sales Ad:`, // Ensure the prompt output is in Portuguese
});

const generateSalesAdFlow = ai.defineFlow(
  {
    name: 'generateSalesAdFlow',
    inputSchema: GenerateSalesAdInputSchema,
    outputSchema: GenerateSalesAdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
