import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';

import { userStore } from '../services/user.store';
import { signToken } from '../utils/jwt';

const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'password must be at least 8 characters' });
    return;
  }

  if (userStore.findByEmail(email)) {
    res.status(409).json({ message: 'user already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userStore.create(email, passwordHash);
  const token = signToken({ sub: user.id, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  const user = userStore.findByEmail(email);
  if (!user) {
    res.status(401).json({ message: 'invalid credentials' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ message: 'invalid credentials' });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};
