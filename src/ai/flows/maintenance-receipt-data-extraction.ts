import { GoogleGenAI, Type } from '@google/genai';

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

  const matches = photoDataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Data URI inválida para processamento.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  const contents = [
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    },
    {
      text: 'Analise a ordem de serviço/nota fiscal veicular (mesmo que tenha múltiplas páginas). Extraia a data no formato DD/MM/AAAA (se o ano tiver 2 dígitos como 23, converta para 2023), o KM, o nome do fornecedor, os itens (peças e serviços com seus valores) e o valor total final.',
    },
  ];

  const config = {
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
          description: 'Quilometragem informada',
        },
        fornecedor: {
          type: Type.STRING,
          description: 'Nome da oficina',
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              descricao: { type: Type.STRING },
              valor: { type: Type.NUMBER },
            },
            required: ['descricao', 'valor'],
          },
        },
        total: {
          type: Type.NUMBER,
          description: 'Valor total geral da nota',
        },
      },
      required: ['date', 'fornecedor', 'items', 'total'],
    },
  };

  let response;

  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config,
    });
  } catch (err: any) {
    console.warn('>>> Gemini 2.5 ocupado/com erro. Alternando para 1.5-flash...', err?.message);
    response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents,
      config,
    });
  }

  const responseText = response.text;
  if (!responseText) {
    throw new Error('A IA não retornou conteúdo válido.');
  }

  return JSON.parse(responseText) as MaintenanceExtractionOutput;
}