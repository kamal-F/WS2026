import type { Request, Response } from "express";
import { loginSchema, type LoginInput } from "../schemas/auth.js";
import { getDemoCredentials, signJwt } from "../services/auth.js";
import type { ErrorBody, SuccessBody } from "../types/api.js";

type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: {
    email: string;
    role: string;
  };
};

export const login = (
  req: Request<Record<string, never>, SuccessBody<LoginResponse> | ErrorBody, LoginInput>,
  res: Response<SuccessBody<LoginResponse> | ErrorBody>
) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Body request login tidak valid",
        issues: parsed.error.flatten().fieldErrors
      }
    });
  }

  const credentials = getDemoCredentials();

  if (
    parsed.data.email !== credentials.email ||
    parsed.data.password !== credentials.password
  ) {
    return res.status(401).json({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email atau password salah"
      }
    });
  }

  const expiresInSeconds = 3600;
  const accessToken = signJwt(
    {
      sub: "user-001",
      email: credentials.email,
      role: "admin"
    },
    expiresInSeconds
  );

  return res.json({
    data: {
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds,
      user: {
        email: credentials.email,
        role: "admin"
      }
    }
  });
};
