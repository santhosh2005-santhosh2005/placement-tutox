import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

type InMemoryUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

// Simple in-memory store for demo purposes
const usersByEmail: Record<string, InMemoryUser> = {};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Non-fatal default for local dev; should be set in production
    return 'dev-secret-change-me';
  }
  return secret;
}

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: Omit<InMemoryUser, 'passwordHash'>; }> {
  const normalizedEmail = email.toLowerCase();
  if (usersByEmail[normalizedEmail]) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: InMemoryUser = {
    id: `u_${Date.now()}`,
    name,
    email: normalizedEmail,
    passwordHash,
  };
  usersByEmail[normalizedEmail] = newUser;

  const token = jwt.sign({ sub: newUser.id, email: newUser.email, name: newUser.name }, getJwtSecret(), { expiresIn: '7d' });
  const { passwordHash: _, ...publicUser } = newUser;
  return { token, user: publicUser };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: Omit<InMemoryUser, 'passwordHash'>; }> {
  const normalizedEmail = email.toLowerCase();
  const user = usersByEmail[normalizedEmail];
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, getJwtSecret(), { expiresIn: '7d' });
  const { passwordHash: _, ...publicUser } = user;
  return { token, user: publicUser };
}

export function verifyToken(token: string): { sub: string; email: string; name?: string } {
  return jwt.verify(token, getJwtSecret()) as any;
}

export function getUserFromToken(token: string): Omit<InMemoryUser, 'passwordHash'> | null {
  try {
    const payload = verifyToken(token);
    const user = Object.values(usersByEmail).find(u => u.id === payload.sub);
    if (!user) return null;
    const { passwordHash: _, ...publicUser } = user;
    return publicUser;
  } catch {
    return null;
  }
}


