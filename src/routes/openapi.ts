import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "express";

export const openApiRouter = Router();

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WS2026 API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;

openApiRouter.get("/openapi.yaml", (_req, res) => {
  const specPath = resolve(process.cwd(), "openapi", "openapi.yaml");
  const spec = readFileSync(specPath, "utf8");

  res.type("text/yaml");
  return res.send(spec);
});

openApiRouter.get("/docs", (_req, res) => {
  res.type("text/html");
  return res.send(swaggerHtml);
});
