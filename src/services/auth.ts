import { createHmac, timingSafeEqual } from "node:crypto";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  exp: number;
};

const base64UrlEncode = (value: string) => {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const base64UrlDecode = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const getJwtSecret = () => {
  return process.env.JWT_SECRET ?? "ws2026-secret-key";
};

const getApiKey = () => {
  return process.env.API_KEY ?? "ws2026-api-key";
};

export const getDemoCredentials = () => {
  return {
    email: process.env.AUTH_DEMO_EMAIL ?? "admin@ws2026.local",
    password: process.env.AUTH_DEMO_PASSWORD ?? "secret123"
  };
};

export const signJwt = (payload: Omit<JwtPayload, "exp">, expiresInSeconds = 3600) => {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const fullPayload: JwtPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getJwtSecret())
    .update(unsignedToken)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${unsignedToken}.${signature}`;
};

export const verifyJwt = (token: string) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac("sha256", getJwtSecret())
    .update(unsignedToken)
    .digest();

  const receivedSignature = Buffer.from(
    signature.replaceAll("-", "+").replaceAll("_", "/"),
    "base64"
  );

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

export const verifyApiKey = (apiKey: string) => {
  return apiKey === getApiKey();
};
