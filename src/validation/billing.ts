import { z } from 'zod';
export const createInvoiceSchema = z.object({ body: z.any() });
export const createPaymentSchema = z.object({ body: z.any() });
