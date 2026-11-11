import type { Request, Response } from 'express';
import { app } from '../server.ts';

export default async function handler(req: Request, res: Response) {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = url.searchParams.get('route');

    if (!route) {
      res.status(404).json({ error: 'Ruta API no encontrada.' });
      return;
    }

    url.searchParams.delete('route');
    req.url = `/api/${route}${url.search}`;

    app(req, res);
  } catch (error) {
    console.error('[Vercel API] No se pudo iniciar la aplicación Express:', error);
    res.status(500).json({
      error: 'La función API no pudo iniciar. Consulta los logs de Functions en Vercel.',
      diagnostic: error instanceof Error ? `${error.name}: ${error.message}` : 'Error desconocido'
    });
  }
}
