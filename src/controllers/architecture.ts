import type { Request, Response } from "express";
import {
  getCatalogServiceDescriptor,
  getCatalogServiceHealth,
  getCatalogServiceStats
} from "../services/catalog-service.js";
import {
  getIdentityServiceDescriptor,
  getIdentityServiceHealth
} from "../services/identity-service.js";
import type { SuccessBody } from "../types/api.js";

type ServiceOverview = {
  name: string;
  kind: "domain-service";
  basePath: string;
  healthPath: string;
  responsibilities: string[];
  integrations: string[];
};

type ArchitectureOverview = {
  style: string;
  gateway: {
    name: string;
    publicRoutes: string[];
  };
  services: ServiceOverview[];
  dataFlow: string[];
  currentState: {
    catalogStats: ReturnType<typeof getCatalogServiceStats>;
    identityHealth: ReturnType<typeof getIdentityServiceHealth>;
    catalogHealth: ReturnType<typeof getCatalogServiceHealth>;
  };
};

export const getArchitectureOverview = (
  _req: Request,
  res: Response<SuccessBody<ArchitectureOverview>>
) => {
  return res.json({
    data: {
      style: "microservice-ready modular monolith",
      gateway: {
        name: "ws2026-api-gateway",
        publicRoutes: ["/api/v1/auth", "/api/v1/books", "/docs", "/openapi.yaml"]
      },
      services: [
        getIdentityServiceDescriptor(),
        getCatalogServiceDescriptor()
      ],
      dataFlow: [
        "Client mengakses gateway pada path /api/v1/*",
        "Gateway meneruskan request ke boundary identity atau catalog",
        "Catalog service mengelola data buku dan statistik katalog",
        "Identity service menangani login, token, dan validasi kredensial"
      ],
      currentState: {
        catalogStats: getCatalogServiceStats(),
        identityHealth: getIdentityServiceHealth(),
        catalogHealth: getCatalogServiceHealth()
      }
    }
  });
};
