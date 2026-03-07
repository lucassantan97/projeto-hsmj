import { adminDb } from '@/firebase/admin';

export type MaintenanceReceiptInput = {
  plate: string;
  supplier: string;
  amount: number;
  description?: string;
  category?: string;
  receiptNumber?: string;
};

export async function createMaintenanceReceipt(data: MaintenanceReceiptInput) {
  const payload = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await adminDb.collection('maintenance_receipts').add(payload);

  return {
    id: docRef.id,
    ...payload,
  };
}