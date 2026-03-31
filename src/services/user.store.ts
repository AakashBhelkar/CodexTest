import { randomUUID } from 'node:crypto';

import type { User } from '../types/user';

const usersByEmail = new Map<string, User>();

export const userStore = {
  findByEmail(email: string): User | undefined {
    return usersByEmail.get(email.toLowerCase());
  },

  create(email: string, passwordHash: string): User {
    const normalizedEmail = email.toLowerCase();
    const user: User = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
    };

    usersByEmail.set(normalizedEmail, user);
    return user;
  },

  clear(): void {
    usersByEmail.clear();
  },
};
