import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getSession(req, res) {
  return getServerSession(req, res, authOptions);
}

export function withAuth(handler) {
  return async (req, res) => {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    req.session = session;
    return handler(req, res);
  };
}

export function withAdmin(handler) {
  return async (req, res) => {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sin permisos de administrador' });
    }
    req.session = session;
    return handler(req, res);
  };
}

export function successResponse(data, statusCode = 200) {
  return { statusCode, data };
}

export function errorResponse(message, statusCode = 400) {
  return { statusCode, error: message };
}

export function apiHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}
