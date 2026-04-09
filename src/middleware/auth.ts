import type { NextFunction, Request, Response } from "express";
import type { ErrorBody } from "../types/api.js";
import { verifyApiKey, verifyJwt } from "../services/auth.js";

const unauthorized = (res: Response<ErrorBody>, message: string) => {
  return res.status(401).json({
    error: {
      code: "UNAUTHORIZED",
      message
    }
  });
};

export const requireAuth = (
  req: Request,
  res: Response<ErrorBody>,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  const apiKey = req.header("x-api-key");

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length);
    const payload = verifyJwt(token);

    if (!payload) {
      return unauthorized(res, "Token tidak valid atau sudah kedaluwarsa");
    }

    req.auth = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      source: "jwt"
    };

    return next();
  }

  if (apiKey) {
    if (!verifyApiKey(apiKey)) {
      return unauthorized(res, "API key tidak valid");
    }

    req.auth = {
      sub: "api-key-user",
      email: "api-key@ws2026.local",
      role: "writer",
      source: "api-key"
    };

    return next();
  }

  return unauthorized(res, "Akses memerlukan Bearer token atau x-api-key");
};
