import { Router } from 'express';
import * as patientHandler from '../handlers/patient.handler.js';
import { validateRequest } from '../middlewares/validate.js';
import { createPatientSchema, updatePatientSchema } from '../validation/patient.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Public route — landing page patient self-registration (no auth required)
router.post('/register', patientHandler.create);

router.use(authenticate); // Require authentication for all other patient routes

router.post('/', validateRequest(createPatientSchema), patientHandler.create);
router.get('/', patientHandler.getAll);
router.get('/:id', patientHandler.getOne);
router.put('/:id', validateRequest(updatePatientSchema), patientHandler.update);
router.delete('/:id', patientHandler.remove);

export default router;
