import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { maintenanceReceiptDataExtraction } from '@/ai/flows/maintenance-receipt-data-extraction';
import type { Vehicle, Maintenance } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const vehicleId = formData.get('vehicleId') as string | null;
    const ownerUserId = formData.get('ownerUserId') as string | null;

    if (!file || !vehicleId || !ownerUserId) {
      return NextResponse.json({ error: 'Missing required fields: file, vehicleId, ownerUserId' }, { status: 400 });
    }

    // 1. Convert file to data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    // 2. Call AI to extract data
    const extractionResult = await maintenanceReceiptDataExtraction({ photoDataUri: dataUri });

    // 3. Get vehicle doc ref
    const vehicleRef = adminDb.collection('users').doc(ownerUserId).collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    const vehicleData = vehicleDoc.data() as Vehicle;

    // 4. Create new maintenance record from AI result
    const newMaintenanceRecord: Maintenance = {
      id: `maint-${vehicleId}-${Date.now()}`,
      data: extractionResult.date,
      km: extractionResult.km,
      fornecedor: extractionResult.fornecedor,
      // The AI now extracts item descriptions and values
      items: extractionResult.items,
      total: extractionResult.total,
    };

    // 5. Update vehicle in Firestore
    await vehicleRef.update({
        maintenances: FieldValue.arrayUnion(newMaintenanceRecord),
        kmAtual: Math.max(vehicleData.kmAtual || 0, newMaintenanceRecord.km),
    });

    return NextResponse.json({ success: true, message: 'Maintenance record added automatically.', data: newMaintenanceRecord });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'An internal error occurred.', details: error.message }, { status: 500 });
  }
}
