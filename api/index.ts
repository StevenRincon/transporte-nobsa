import type { Request, Response } from 'express';
import { app } from '../server';

export default function handler(req: Request, res: Response) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const route = url.searchParams.get('route');

  if (!route) {
    res.status(404).json({ error: 'Ruta API no encontrada.' });
    return;
  }

  url.searchParams.delete('route');
  req.url = `/api/${route}${url.search}`;
  app(req, res);
}
