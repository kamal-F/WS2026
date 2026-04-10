import { Router } from "express";
import { getArchitectureOverview } from "../controllers/architecture.js";

export const architectureRouter = Router();

architectureRouter.get("/services", getArchitectureOverview);
