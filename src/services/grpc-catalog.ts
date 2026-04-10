import { resolve } from "node:path";
import * as grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { findBookById } from "./books.js";

type BookSummaryReply = {
  id: string;
  title: string;
  author: string;
  year: number;
  createdAt: string;
  summary: string;
  servedBy: string;
};

type GrpcHealth = {
  status: "idle" | "listening";
  port: number;
  service: string;
  protoPath: string;
};

type LoadedProto = {
  ws2026: {
    catalog: {
      v1: {
        CatalogRpc: grpc.ServiceClientConstructor & {
          service: grpc.ServiceDefinition;
        };
      };
    };
  };
};

const protoPath = resolve(process.cwd(), "proto", "catalog.proto");
const grpcPort = Number(process.env.GRPC_PORT ?? 50051);

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const loadedProto = grpc.loadPackageDefinition(packageDefinition) as unknown as LoadedProto;
const catalogRpcDefinition = loadedProto.ws2026.catalog.v1.CatalogRpc;

let grpcServer: grpc.Server | null = null;
let grpcStartupPromise: Promise<void> | null = null;
let grpcHealth: GrpcHealth = {
  status: "idle",
  port: grpcPort,
  service: "catalog-rpc",
  protoPath
};

const buildSummary = (id: string) => {
  const book = findBookById(id);

  if (!book) {
    return null;
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    year: book.year,
    createdAt: book.createdAt,
    summary: `${book.title} ditulis oleh ${book.author} pada tahun ${book.year}`,
    servedBy: "catalog-rpc"
  } satisfies BookSummaryReply;
};

export const initializeCatalogGrpcServer = () => {
  if (grpcStartupPromise) {
    return grpcStartupPromise;
  }

  grpcServer = new grpc.Server();

  grpcServer.addService(catalogRpcDefinition.service, {
    GetBookSummary: (
      call: grpc.ServerUnaryCall<{ id: string }, BookSummaryReply>,
      callback: grpc.sendUnaryData<BookSummaryReply>
    ) => {
      const result = buildSummary(call.request.id);

      if (!result) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Buku tidak ditemukan"
        });
        return;
      }

      callback(null, result);
    }
  });

  grpcStartupPromise = new Promise((resolvePromise, rejectPromise) => {
    grpcServer?.bindAsync(
      `0.0.0.0:${grpcPort}`,
      grpc.ServerCredentials.createInsecure(),
      (error) => {
        if (error) {
          rejectPromise(error);
          return;
        }

        grpcServer?.start();
        grpcHealth = {
          status: "listening",
          port: grpcPort,
          service: "catalog-rpc",
          protoPath
        };
        resolvePromise();
      }
    );
  });

  return grpcStartupPromise;
};

export const getCatalogGrpcHealth = () => {
  return grpcHealth;
};

export const getCatalogGrpcDescriptor = () => {
  return {
    name: "catalog-rpc",
    kind: "rpc-service" as const,
    basePath: "grpc://localhost:50051",
    healthPath: "/services/grpc/health",
    responsibilities: [
      "Menyediakan RPC call berbasis .proto",
      "Mengembalikan ringkasan buku lewat unary gRPC",
      "Menunjukkan komunikasi service-to-service berbasis RPC"
    ],
    integrations: ["catalog-service data", "REST gateway client", "Protocol Buffers"]
  };
};

export const getBookSummaryViaGrpc = (id: string) => {
  const client = new catalogRpcDefinition(
    `127.0.0.1:${grpcPort}`,
    grpc.credentials.createInsecure()
  ) as unknown as grpc.Client & {
    GetBookSummary(
      request: { id: string },
      callback: (error: grpc.ServiceError | null, response: BookSummaryReply) => void
    ): void;
  };

  return new Promise<BookSummaryReply>((resolvePromise, rejectPromise) => {
    client.GetBookSummary({ id }, (error, response) => {
      client.close();

      if (error) {
        rejectPromise(error);
        return;
      }

      resolvePromise(response);
    });
  });
};

export const closeCatalogGrpcServer = () => {
  if (!grpcServer) {
    grpcStartupPromise = null;
    grpcHealth = {
      status: "idle",
      port: grpcPort,
      service: "catalog-rpc",
      protoPath
    };
    return Promise.resolve();
  }

  return new Promise<void>((resolvePromise, rejectPromise) => {
    grpcServer?.tryShutdown((error) => {
      if (error) {
        rejectPromise(error);
        return;
      }

      grpcServer = null;
      grpcStartupPromise = null;
      grpcHealth = {
        status: "idle",
        port: grpcPort,
        service: "catalog-rpc",
        protoPath
      };
      resolvePromise();
    });
  });
};
