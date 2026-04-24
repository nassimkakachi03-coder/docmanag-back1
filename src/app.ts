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

const dynamicOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    const isLocalhost = !!origin && /^https?:\/\/localhost:\d+$/.test(origin);
    const isAllowed = !!origin && (allowedOrigins.includes(origin) || dynamicOrigins.includes(origin));
    if (!origin || isLocalhost || isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Default route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Dental Clinic API is running' });
});

// Routes
import authRouter from './routers/auth.router.js';
import patientRouter from './routers/patient.router.js';
import patientAuthRouter from './routers/patientAuth.router.js';
import appointmentRouter from './routers/appointment.router.js';
import prescriptionRouter from './routers/prescription.router.js';
import certificateRouter from './routers/certificate.router.js';
import inventoryRouter from './routers/inventory.router.js';
import billingRouter from './routers/billing.router.js';
import dashboardRouter from './routers/dashboard.router.js';
import contactRouter from './routers/contact.router.js';
import notificationRouter from './routers/notification.router.js';

app.use('/api/auth', authRouter);
app.use('/api/patients', patientRouter);
app.use('/api/patient-auth', patientAuthRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/billing', billingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/contact', contactRouter);
app.use('/api/notifications', notificationRouter);

// Global Error Handler
import { errorHandler } from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;

