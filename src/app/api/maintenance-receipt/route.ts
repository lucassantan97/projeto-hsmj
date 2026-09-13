import { GoogleGenAI, Type } from '@google/genai';

// Inicializa a SDK puxando automaticamente a GEMINI_API_KEY do seu .env.local
const ai = new GoogleGenAI({});

export interface MaintenanceExtractionInput {
  photoDataUri: string;
}

export interface MaintenanceItem {
  descricao: string;
  valor: number;
}

export interface MaintenanceExtractionOutput {
  date: string;
  km: number;
  fornecedor: string;
  items: MaintenanceItem[];
  total: number;
}

export async function maintenanceReceiptDataExtraction(
  input: MaintenanceExtractionInput
): Promise<MaintenanceExtractionOutput> {
  const { photoDataUri } = input;

  // Extrai o tipo mime e a string base64 pura da Data URI
  const matches = photoDataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Data URI inválida para processamento.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Chama o modelo gemini-2.5-flash estruturando a resposta exata em JSON
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
      {
        text: 'Analise a nota fiscal/recibo de manutenção veicular anexado e extraia as informações detalhadas em formato JSON estruturado.',
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: {
            type: Type.STRING,
            description: 'Data do serviço no formato DD/MM/AAAA',
          },
          km: {
            type: Type.NUMBER,
            description: 'Quilometragem do veículo informada na nota',
          },
          fornecedor: {
            type: Type.STRING,
            description: 'Nome da oficina ou prestador de serviço',
          },
          items: {
            type: Type.ARRAY,
            description: 'Lista de peças e serviços prestados',
            items: {
              type: Type.OBJECT,
              properties: {
                descricao: { type: Type.STRING, description: 'Descrição da peça ou serviço' },
                valor: { type: Type.NUMBER, description: 'Valor em Reais (BRL)' },
              },
              required: ['descricao', 'valor'],
            },
          },
          total: {
            type: Type.NUMBER,
            description: 'Valor total da nota fiscal',
          },
        },
        required: ['date', 'fornecedor', 'items', 'total'],
      },
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('A IA não retornou uma resposta válida.');
  }

  return JSON.parse(responseText) as MaintenanceExtractionOutput;
}