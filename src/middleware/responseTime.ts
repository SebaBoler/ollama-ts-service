import { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Response {
    responseTime?: string;
  }
}

export const measureResponseTime = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  res.on('finish', () => {
    const end = performance.now();
    const duration = end - start;
    res.responseTime = `${duration.toFixed(2)} ms`;
    console.log(`Response time for ${req.method} ${req.originalUrl}: ${duration.toFixed(2)} ms`);
  });
  next();
};