import { Router } from "express";
import { login } from "../controllers/auth.js";
import { getIdentityServiceHealth } from "../services/identity-service.js";

export const identityServiceRouter = Router();

identityServiceRouter.get("/health", (_req, res) => {
  return res.json(getIdentityServiceHealth());
});

identityServiceRouter.post("/login", login);
