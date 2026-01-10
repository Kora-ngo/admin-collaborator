// src/utils/handleGlobalError.ts
import type { Request, Response } from 'express';

export const handleGlobalError = (
  err: any,
  req: Request,
  res: Response,
  isDev: boolean = process.env.NODE_ENV === 'development'
) => {
  // Log full error details (for debugging)
  console.error('GLOBAL ERROR:', {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    status: err.status || 500,
  });

  // Specific error handling
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      type: 'error',
      message: 'file_too_large',
    });
  }

  if (err.name === 'SequelizeDatabaseError' || err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      type: 'error',
      message: 'database_connection_error',
    });
  }

  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.message?.includes('timeout')) {
    return res.status(504).json({
      type: 'error',
      message: 'request_timeout',
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      type: 'error',
      message: 'invalid_or_expired_token',
    });
  }

  // Fallback for all other unexpected/random errors
  const status = err.status || 500;
  const message = status === 500 
    ? 'internal_server_error' 
    : (err.message || 'unexpected_error');

  return res.status(status).json({
    type: 'error',
    message,
    ...(isDev && { error: err.message, stack: err.stack }), // show details only in dev
  });
};