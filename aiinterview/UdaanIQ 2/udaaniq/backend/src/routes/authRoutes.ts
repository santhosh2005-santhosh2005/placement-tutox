import express, { Router, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { loginUser, registerUser, getUserFromToken } from '../services/authService';

const router: Router = express.Router();

// Attach cookie parser locally to this router
router.use(cookieParser());

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }
    const { token, user } = await registerUser(name, email, password);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const { token, user } = await loginUser(email, password);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || 'Login failed' });
  }
});

router.post('/auth/logout', async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;
    const token = tokenFromHeader || (req as any).cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;


