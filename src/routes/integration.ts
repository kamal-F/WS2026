import { Router } from "express";
import {
  getIntegratedBookOverview,
  getObservabilityStatus,
  getRequestLogs
} from "../controllers/integration.js";

export const integrationRouter = Router();
export const observabilityRouter = Router();

integrationRouter.get("/books/:id/overview", getIntegratedBookOverview);

observabilityRouter.get("/health", getObservabilityStatus);
observabilityRouter.get("/logs", getRequestLogs);
