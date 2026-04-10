import type { NextFunction, Request, Response } from "express";
import { recordRequestLog } from "../services/observability.js";

export const captureRequestLog = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    recordRequestLog(req, res, startedAt);
  });

  next();
};
