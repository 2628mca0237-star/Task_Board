// src/types/express.d.ts
import { JwtUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}