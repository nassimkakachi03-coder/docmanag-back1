import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PatientAccount from '../models/patientAccount.js';
import Patient from '../models/patient.js';
import Appointment from '../models/appointment.js';
import { buildPatientHistory } from '../services/patientHistory.service.js';
import { generateToken } from '../utils/jwt.js';
import Notification from '../models/notification.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await PatientAccount.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let patient = await Patient.findOne({ email: normalizedEmail });
    if (!patient) {
      patient = await Patient.create({
        firstName,
        lastName,
        phone,
        email: normalizedEmail,
        source: 'patient-portal',
        medicalHistory: 'Inscription via le site web',
      });
    } else {
      patient.firstName = patient.firstName || firstName;
      patient.lastName = patient.lastName || lastName;
      patient.phone = patient.phone || phone;
      patient.email = patient.email || normalizedEmail;
      patient.source = 'patient-portal';
      if (!patient.medicalHistory) {
        patient.medicalHistory = 'Inscription via le site web';
      }
      await patient.save();
    }

    const account = await PatientAccount.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      patientId: patient._id,
    });

    patient.accountId = account._id as any;
    await patient.save();

    const token = generateToken(account._id.toString(), 'Patient');
    
    // Create Notification
    await Notification.create({
      title: 'Nouveau patient inscrit',
      message: `${firstName} ${lastName} vient de créer son espace patient en ligne.`,
      type: 'NewPatient',
      link: `/patients/${patient._id}`
    });

    return res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user: {
        id: account._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        patientId: patient._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const account = await PatientAccount.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const token = generateToken(account._id.toString(), 'Patient');
    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: account._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        patientId: account.patientId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authReq = req as any;
    const account = await PatientAccount.findById(authReq.user?.id).select('-password');
    if (!account) return res.status(404).json({ message: 'Compte non trouvé.' });
    return res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

export const getMyHistory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authReq = req as any;
    if (authReq.user?.role !== 'Patient') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const account = await PatientAccount.findById(authReq.user?.id).select('-password');
    if (!account) return res.status(404).json({ message: 'Compte non trouvé.' });
    if (!account.patientId) return res.status(404).json({ message: 'Dossier patient introuvable.' });

    const history = await buildPatientHistory(account.patientId.toString());
    if (!history) return res.status(404).json({ message: 'Patient non trouvé.' });

    return res.status(200).json({
      account,
      ...history,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authReq = req as any;
    if (authReq.user?.role !== 'Patient') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const account = await PatientAccount.findById(authReq.user?.id).select('-password');
    if (!account) return res.status(404).json({ message: 'Compte non trouvé.' });
    if (!account.patientId) return res.status(404).json({ message: 'Dossier patient introuvable.' });

    const { date, reason, notes } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ message: 'La date et le motif sont requis.' });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime()) || appointmentDate <= new Date()) {
      return res.status(400).json({ message: 'La date doit être dans le futur.' });
    }

    const patient = await Patient.findById(account.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : `${account.firstName} ${account.lastName}`;

    const appointment = await Appointment.create({
      patientId: account.patientId,
      patientName,
      date: appointmentDate,
      reason: reason.trim(),
      notes: notes?.trim() || 'Rendez-vous pris en ligne par le patient',
      status: 'Pending',
      duration: 30,
    });

    // Create Notification
    await Notification.create({
      title: 'Nouvelle demande de rendez-vous',
      message: `${patientName} a demandé un rendez-vous le ${appointmentDate.toLocaleDateString('fr-FR')} pour le motif : ${reason}.`,
      type: 'NewAppointment',
      link: `/agenda`
    });

    return res.status(201).json({
      message: 'Rendez-vous créé avec succès. Le cabinet vous contactera pour confirmer.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authReq = req as any;
    if (authReq.user?.role !== 'Patient') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const account = await PatientAccount.findById(authReq.user?.id).select('-password');
    if (!account) return res.status(404).json({ message: 'Compte non trouvé.' });
    if (!account.patientId) return res.status(404).json({ message: 'Dossier patient introuvable.' });

    const { medicalHistory, xRayUrl, prescriptionUrl } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      account.patientId,
      { 
        ...(medicalHistory !== undefined && { medicalHistory }),
        ...(xRayUrl !== undefined && { xRayUrl: xRayUrl.trim() }),
        ...(prescriptionUrl !== undefined && { prescriptionUrl: prescriptionUrl.trim() })
      },
      { new: true }
    );

    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });

    // Create Notification if profile updated
    await Notification.create({
      title: 'Mise à jour du dossier médical',
      message: `${patient.firstName} ${patient.lastName} vient d'ajouter de nouvelles informations ou documents (radio/ordonnance) à son dossier.`,
      type: 'ProfileUpdate',
      link: `/patients/${patient._id}`
    });

    return res.status(200).json({
      message: 'Dossier médical mis à jour avec succès.',
      patient: {
        medicalHistory: patient.medicalHistory,
        xRayUrl: patient.xRayUrl,
        prescriptionUrl: patient.prescriptionUrl,
      }
    });
  } catch (error) {
    next(error);
  }
};
