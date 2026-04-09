import type { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      sub: string;
      email: string;
      role: string;
      source: "jwt" | "api-key";
    };
  }
}

export type AppRequest = Request;
