import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  
  if (!authorization) {
    res.status(401).json({ message: 'Token not found!' });
    return;
  }
  
  const token = authorization.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const generateToken = (userData: { email: string; id: number }): string => {
  return jwt.sign(userData, process.env.JWT_KEY!, { expiresIn: '1h' });
};