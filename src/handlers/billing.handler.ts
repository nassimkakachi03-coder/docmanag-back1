import { Request, Response, NextFunction } from 'express';
import * as billingService from '../services/billing.service.js';

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = await billingService.createInvoice(req.body);
    return res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = await billingService.getInvoices();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const payInvoice = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = await billingService.processPayment(req.body);
    return res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = await billingService.getPayments();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
