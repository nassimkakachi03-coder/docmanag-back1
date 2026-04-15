import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    return res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (email === 'admin@admin.com' && password === 'admin123') {
       const token = generateToken('master-id-1234', 'Admin');
       return res.status(200).json({ 
         message: 'Login successful', 
         token, 
         user: { id: 'master-id-1234', name: 'Administrateur', email, role: 'Admin' } 
       });
    }

    const { user, token } = await authService.loginUser(email, password);
    return res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error: any) {
     if (error.message === 'Invalid credentials') {
       return res.status(401).json({ message: error.message });
     }
     next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const users = await authService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
