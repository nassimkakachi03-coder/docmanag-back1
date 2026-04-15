import { z } from 'zod';
export const createPrescriptionSchema = z.object({ body: z.any() });
