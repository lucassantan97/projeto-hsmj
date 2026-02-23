'use server';
/**
 * @fileOverview A chat agent for answering questions about the vehicle fleet.
 *
 * - ask - A function that handles the chat process.
 * - ChatInput - The input type for the ask function.
 * - ChatOutput - The return type for the ask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MaintenanceItemSchema = z.object({
  descricao: z.string(),
  valor: z.number(),
});

const MaintenanceSchema = z.object({
  id: z.string(),
  data: z.string(),
  km: z.number(),
  fornecedor: z.string(),
  items: z.array(MaintenanceItemSchema),
  total: z.number(),
});

const SaleSchema = z.object({
  dataVenda: z.string(),
  valorVenda: z.number(),
  comprador: z.string(),
  salesDescription: z.string().optional(),
});

const VehicleSchema = z.object({
  id: z.string(),
  placa: z.string(),
  modelo: z.string(),
  cliente: z.string(),
  anoModelo: z.string(),
  valorCompra: z.number(),
  status: z.enum(['ativo', 'vendido']),
  empresa: z.enum(['HS', 'MJ']),
  renavam: z.string().optional(),
  chassi: z.string().optional(),
  dataEntrada: z.string().optional(),
  observacao: z.string().optional(),
  vendaInfo: SaleSchema.optional(),
  maintenances: z.array(MaintenanceSchema).optional(),
  totalMaint: z.number().optional(),
  kmAtual: z.number().optional(),
  licenciamento: z.string().optional(),
  forSale: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  fipeValue: z.number().optional(),
});

export const ChatInputSchema = z.object({
  question: z.string().describe("The user's question about the vehicle fleet."),
  vehicles: z.array(VehicleSchema).describe('The list of vehicles in the fleet.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are a helpful fleet management assistant. Your name is FleetWise AI.
    Answer the user's question based on the provided fleet data.
    Be concise and helpful. Respond in Portuguese.

    Fleet Data (JSON format):
    {{jsonStringify vehicles}}

    User's Question:
    "{{question}}"
    `,
});

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatInputSchema,
        outputSchema: ChatOutputSchema,
    },
    async (input) => {
        const { output } = await chatPrompt(input);
        if (!output) {
            throw new Error('Chat prompt failed to produce output.');
        }
        return output;
    }
);

export async function ask(input: ChatInput): Promise<ChatOutput> {
    return chatFlow(input);
}
