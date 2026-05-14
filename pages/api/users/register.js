import { prisma } from '@/lib/prisma';
import { validateRegisterInput } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    const validation = validateRegisterInput(email, password, name);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Error al registrarse' });
  }
}
