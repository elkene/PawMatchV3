import { prisma } from '@/lib/prisma';
import { validateEmail } from '@/lib/validations';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body.action === 'request') {
    try {
      const { email } = req.body;

      if (!email || !validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(200).json({ message: 'Si el email existe, recibirás un enlace de recuperación' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          token: hashedToken,
          expiresAt,
          used: false,
        },
        update: {
          token: hashedToken,
          expiresAt,
          used: false,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@pawmatch.com',
        to: email,
        subject: 'Recupera tu contraseña - PawMatch',
        html: `
          <h2>Solicitud de recuperación de contraseña</h2>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p><a href="${resetUrl}">Restablecer contraseña</a></p>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste esto, ignora este email.</p>
        `,
      });

      return res.status(200).json({ message: 'Si el email existe, recibirás un enlace de recuperación' });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ error: 'Error al procesar solicitud' });
    }
  }

  if (req.method === 'POST' && req.body.action === 'reset') {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Email no encontrado' });
      }

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { userId: user.id },
      });

      if (!resetToken || resetToken.used) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: 'El token ha expirado' });
      }

      const hashedToken = hashToken(token);
      if (resetToken.token !== hashedToken) {
        return res.status(400).json({ error: 'Token inválido' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.update({
        where: { userId: user.id },
        data: { used: true },
      });

      return res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
