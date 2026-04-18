import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',                  // admin-front dev
  'http://localhost:5174',                  // landing-page dev
  'https://docmanag-landing.vercel.app',    // landing production
  'https://docmanag-front-a3n1.vercel.app', // admin production
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Default route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Dental Clinic API is running' });
});

// Routes
import authRouter from './routers/auth.router.js';
import patientRouter from './routers/patient.router.js';
import appointmentRouter from './routers/appointment.router.js';
import prescriptionRouter from './routers/prescription.router.js';
import certificateRouter from './routers/certificate.router.js';
import inventoryRouter from './routers/inventory.router.js';
import billingRouter from './routers/billing.router.js';
import dashboardRouter from './routers/dashboard.router.js';
import contactRouter from './routers/contact.router.js';

app.use('/api/auth', authRouter);
app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/contact', contactRouter);

// Global Error Handler
import { errorHandler } from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;
