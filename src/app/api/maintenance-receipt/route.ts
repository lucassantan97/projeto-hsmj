import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { maintenanceReceiptDataExtraction } from '@/ai/flows/maintenance-receipt-data-extraction';
import type { Vehicle, Maintenance } from '@/lib/types';

export const dynamic = 'force-dynamic';

function parseMaintenanceDate(dateString: string): number {
  if (!dateString) return 0;

  // Espera formato brasileiro: dd/mm/aaaa
  const parts = dateString.split('/');

  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);

    if (!day || !month || !year) return 0;

    return new Date(year, month - 1, day).getTime();
  }

  // Fallback para outros formatos, se vierem
  const fallback = new Date(dateString).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { error: 'API_SECRET_KEY não configurada no servidor.' },
      { status: 500 }
    );
  }

  if (apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const vehicleId = formData.get('vehicleId') as string | null;
    const ownerUserId = formData.get('ownerUserId') as string | null;

    if (!file || !vehicleId || !ownerUserId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: file, vehicleId, ownerUserId' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Arquivo inválido. Envie uma imagem ou PDF.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    const extractionResult = await maintenanceReceiptDataExtraction({
      photoDataUri: dataUri,
    });

    const vehicleRef = adminDb
      .collection('users')
      .doc(ownerUserId)
      .collection('vehicles')
      .doc(vehicleId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const vehicleDoc = await transaction.get(vehicleRef);

      if (!vehicleDoc.exists) {
        throw new Error('VEHICLE_NOT_FOUND');
      }

      const vehicleData = vehicleDoc.data() as Vehicle;
      const extractedKm = Number(extractionResult.km || 0);

      const newMaintenanceRecord: Maintenance = {
        id: `maint-${vehicleId}-${Date.now()}`,
        data: extractionResult.date,
        km: extractedKm,
        fornecedor: extractionResult.fornecedor,
        items: extractionResult.items,
        total: extractionResult.total,
      };

      const currentMaintenances = Array.isArray(vehicleData.maintenances)
        ? vehicleData.maintenances
        : [];

      const sortedMaintenances = [...currentMaintenances, newMaintenanceRecord].sort(
        (a, b) => {
          const dateDiff =
            parseMaintenanceDate(a.data) - parseMaintenanceDate(b.data);

          if (dateDiff !== 0) return dateDiff;

          return (a.km || 0) - (b.km || 0);
        }
      );

      transaction.update(vehicleRef, {
        maintenances: sortedMaintenances,
        kmAtual: Math.max(vehicleData.kmAtual || 0, extractedKm),
      });

      return newMaintenanceRecord;
    });

    return NextResponse.json({
      success: true,
      message: 'Registro de manutenção adicionado com sucesso.',
      data: result,
    });
  } catch (error: any) {
    console.error('Erro na API:', error);

    if (error.message === 'VEHICLE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Ocorreu um erro interno no servidor.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}