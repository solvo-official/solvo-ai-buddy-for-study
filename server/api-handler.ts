import type { Request, Response } from 'express';
import app from './index.ts';

export default function handler(req: Request, res: Response) {
  // Restore original path if rewritten by Vercel
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-vercel-matched-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string);

  if (matchedPath && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
