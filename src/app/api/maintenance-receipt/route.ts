import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { maintenanceReceiptDataExtraction } from '@/ai/flows/maintenance-receipt-data-extraction';
import type { Vehicle, Maintenance } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

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

    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
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

    await vehicleRef.update({
      maintenances: FieldValue.arrayUnion(newMaintenanceRecord),
      kmAtual: Math.max(vehicleData.kmAtual || 0, extractedKm),
    });

    return NextResponse.json({
      success: true,
      message: 'Registro de manutenção adicionado com sucesso.',
      data: newMaintenanceRecord,
    });
  } catch (error: any) {
    console.error('Erro na API:', error);

    return NextResponse.json(
      {
        error: 'Ocorreu um erro interno no servidor.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}