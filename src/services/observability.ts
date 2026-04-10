import type { Request, Response } from "express";

type RequestLogRecord = {
  id: number;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  recordedAt: string;
};

const requestLogs: RequestLogRecord[] = [];
let nextLogId = 1;

export const recordRequestLog = (req: Request, res: Response, startedAt: number) => {
  requestLogs.unshift({
    id: nextLogId,
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode,
    durationMs: Math.round(performance.now() - startedAt),
    recordedAt: new Date().toISOString()
  });

  nextLogId += 1;

  if (requestLogs.length > 50) {
    requestLogs.length = 50;
  }
};

export const listRequestLogs = () => {
  return [...requestLogs];
};

export const getObservabilityHealth = () => {
  return {
    status: "ok" as const,
    service: "gateway-observability",
    boundedContext: "logging-and-observability",
    totalLogs: requestLogs.length
  };
};

export const getObservabilityDescriptor = () => {
  return {
    name: "gateway-observability",
    kind: "observability-service" as const,
    basePath: "/services/observability",
    healthPath: "/services/observability/health",
    responsibilities: [
      "Mencatat request gateway",
      "Menyediakan log observasi sederhana",
      "Menunjukkan konsep observability dasar"
    ],
    integrations: ["API gateway requests", "request tracing sederhana"]
  };
};

export const resetRequestLogs = () => {
  requestLogs.length = 0;
  nextLogId = 1;
};
