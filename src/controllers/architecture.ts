import type { Request, Response } from "express";
import {
  getCatalogServiceDescriptor,
  getCatalogServiceHealth,
  getCatalogServiceStats
} from "../services/catalog-service.js";
import { getMessageBrokerHealth } from "../services/message-broker.js";
import {
  getIdentityServiceDescriptor,
  getIdentityServiceHealth
} from "../services/identity-service.js";
import {
  getNotificationServiceDescriptor,
  getNotificationServiceHealth
} from "../services/notification-service.js";
import {
  getCatalogGrpcDescriptor,
  getCatalogGrpcHealth
} from "../services/grpc-catalog.js";
import type { SuccessBody } from "../types/api.js";

type ServiceOverview = {
  name: string;
  kind: "domain-service" | "rpc-service";
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
    notificationHealth: ReturnType<typeof getNotificationServiceHealth>;
    messageBroker: ReturnType<typeof getMessageBrokerHealth>;
    grpcHealth: ReturnType<typeof getCatalogGrpcHealth>;
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
        getCatalogServiceDescriptor(),
        getNotificationServiceDescriptor(),
        getCatalogGrpcDescriptor()
      ],
      dataFlow: [
        "Client mengakses gateway pada path /api/v1/*",
        "Gateway meneruskan request ke boundary identity atau catalog",
        "Catalog service mengelola data buku dan mem-publish event book.created",
        "Message broker meneruskan event ke consumer",
        "Notification service mengonsumsi event book.created secara asynchronous",
        "REST gateway juga dapat memanggil catalog-rpc lewat gRPC unary call",
        "Identity service menangani login, token, dan validasi kredensial"
      ],
      currentState: {
        catalogStats: getCatalogServiceStats(),
        identityHealth: getIdentityServiceHealth(),
        catalogHealth: getCatalogServiceHealth(),
        notificationHealth: getNotificationServiceHealth(),
        messageBroker: getMessageBrokerHealth(),
        grpcHealth: getCatalogGrpcHealth()
      }
    }
  });
};
