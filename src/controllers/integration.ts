import type { Request, Response } from "express";
import { buildIntegratedBookOverview } from "../services/integration.js";
import { getObservabilityHealth, listRequestLogs } from "../services/observability.js";

export const getIntegratedBookOverview = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const overview = await buildIntegratedBookOverview(req.params.id);

  if (!overview) {
    return res.status(404).json({
      error: {
        code: "BOOK_NOT_FOUND",
        message: "Buku tidak ditemukan untuk integrasi arsitektur"
      }
    });
  }

  return res.json({ data: overview });
};

export const getObservabilityStatus = (_req: Request, res: Response) => {
  return res.json({
    data: getObservabilityHealth()
  });
};

export const getRequestLogs = (_req: Request, res: Response) => {
  return res.json({
    data: listRequestLogs()
  });
};
