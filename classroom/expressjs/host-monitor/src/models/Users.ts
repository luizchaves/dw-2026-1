import { Prisma, type User as PrismaUser } from '@/generated/prisma/client.js';
import cuid from 'cuid';

import { prisma } from '@/database/database.js';
import { HttpError } from '@/errors/HttpError.js';
import { signJwt } from '@/lib/jwt.js';
import { hashPassword, verifyPassword } from '@/lib/password.js';
import type { UserLoginInput, UserRegisterInput } from '@/schemas/auth.js';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: UserRecord;
  token: string;
};

function mapUserRow(row: PrismaUser): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function createToken(user: UserRecord): string {
  return signJwt({
    sub: user.id,
    name: user.name,
    email: user.email,
  });
}

function mapPrismaUserError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new HttpError('Email already registered', 409);
  }

  throw error;
}

async function register(input: UserRegisterInput): Promise<AuthResponse> {
  const now = new Date().toISOString();

  try {
    const row = await prisma.user.create({
      data: {
        id: cuid(),
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        createdAt: now,
        updatedAt: now,
      },
    });
    const user = mapUserRow(row);

    return {
      user,
      token: createToken(user),
    };
  } catch (error) {
    mapPrismaUserError(error);
  }
}

async function login(input: UserLoginInput): Promise<AuthResponse> {
  const row = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!row || !(await verifyPassword(input.password, row.passwordHash))) {
    throw new HttpError('Invalid email or password', 401);
  }

  const user = mapUserRow(row);

  return {
    user,
    token: createToken(user),
  };
}

export default {
  register,
  login,
};

export type { AuthResponse, UserRecord };
