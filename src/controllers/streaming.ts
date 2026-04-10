import type { Request, Response } from "express";
import {
  getEventStreamHealth,
  listStreamTopics,
  replayStream
} from "../services/event-stream.js";

type ReplayQuery = {
  fromOffset?: string;
};

export const getStreamingHealth = (_req: Request, res: Response) => {
  return res.json({
    data: getEventStreamHealth()
  });
};

export const getStreamingTopics = (_req: Request, res: Response) => {
  return res.json({
    data: listStreamTopics()
  });
};

export const replayTopicStream = (
  req: Request<{ topic: string }, unknown, unknown, ReplayQuery>,
  res: Response
) => {
  const fromOffset = Number(req.query.fromOffset ?? 0);

  return res.json({
    data: replayStream(req.params.topic, fromOffset)
  });
};
