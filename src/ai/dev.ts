import { config } from 'dotenv';
config();

import '@/ai/flows/maintenance-receipt-data-extraction.ts';
import '@/ai/flows/generate-sales-ad.ts';
import '@/ai/flows/analyze-maintenance-history.ts';
import '@/ai/flows/chat-flow.ts';
