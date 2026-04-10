import * as grpc from "@grpc/grpc-js";
import type { Request, Response } from "express";
import { getCatalogGrpcHealth, getBookSummaryViaGrpc } from "../services/grpc-catalog.js";

export const getGrpcHealth = (_req: Request, res: Response) => {
  return res.json({
    data: getCatalogGrpcHealth()
  });
};

export const getBookSummaryFromRpc = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const data = await getBookSummaryViaGrpc(req.params.id);

    return res.json({ data });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === grpc.status.NOT_FOUND
    ) {
      return res.status(404).json({
        error: {
          code: "BOOK_NOT_FOUND",
          message: "Buku tidak ditemukan lewat gRPC"
        }
      });
    }

    return res.status(500).json({
      error: {
        code: "GRPC_CALL_FAILED",
        message: "Pemanggilan gRPC gagal"
      }
    });
  }
};
