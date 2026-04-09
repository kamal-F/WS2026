import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "express";

export const openApiRouter = Router();

openApiRouter.get("/openapi.yaml", (_req, res) => {
  const specPath = resolve(process.cwd(), "openapi", "openapi.yaml");
  const spec = readFileSync(specPath, "utf8");

  res.type("text/yaml");
  return res.send(spec);
});
