import { Router } from "express";
import {
  getStreamingHealth,
  getStreamingTopics,
  replayTopicStream
} from "../controllers/streaming.js";

export const streamingRouter = Router();

streamingRouter.get("/health", getStreamingHealth);
streamingRouter.get("/topics", getStreamingTopics);
streamingRouter.get("/topics/:topic/replay", replayTopicStream);
