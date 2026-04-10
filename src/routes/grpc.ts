import { Router } from "express";
import { getBookSummaryFromRpc, getGrpcHealth } from "../controllers/grpc.js";

export const grpcRouter = Router();

grpcRouter.get("/health", getGrpcHealth);
grpcRouter.get("/books/:id/summary", getBookSummaryFromRpc);
