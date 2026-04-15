import { z } from 'zod';
export const createAppointmentSchema = z.object({ body: z.any() });
export const updateAppointmentSchema = z.object({ body: z.any() });
