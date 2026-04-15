import Invoice from '../models/invoice.js';
import Payment from '../models/payment.js';

export const createInvoice = async (data: any) => {
  return await Invoice.create(data);
};

export const getInvoices = async () => {
  return await Invoice.find().sort({ createdAt: -1 });
};

export const getInvoiceById = async (id: string) => {
  return await Invoice.findById(id);
};

export const updateInvoiceStatus = async (id: string, status: string) => {
  return await Invoice.findByIdAndUpdate(id, { status }, { new: true });
};

export const processPayment = async (data: any) => {
  return await Payment.create(data);
};

export const getPayments = async () => {
  return await Payment.find().sort({ createdAt: -1 });
};
