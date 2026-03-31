import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import type { JwtPayload } from '../types/jwt';

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
