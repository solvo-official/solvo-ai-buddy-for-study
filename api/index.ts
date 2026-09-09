import type { Request, Response } from 'express';
import app from '../server/index.ts';

export default function handler(req: Request, res: Response) {
  // Ensure the /api prefix is preserved if stripped by Vercel serverless rewrites
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
