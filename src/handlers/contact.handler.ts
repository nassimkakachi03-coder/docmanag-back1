import { Request, Response, NextFunction } from 'express';
import Contact from '../models/contact.js';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const contact = await Contact.create({ ...req.body, read: false });
    return res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Message non trouvé' });
    return res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Message non trouvé' });
    return res.status(200).json({ message: 'Message supprimé' });
  } catch (error) {
    next(error);
  }
};
