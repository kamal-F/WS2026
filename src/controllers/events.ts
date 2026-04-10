import type { Request, Response } from "express";
import { getMessageBrokerHealth } from "../services/message-broker.js";
import {
  getNotificationServiceHealth,
  listNotificationRecords
} from "../services/notification-service.js";

export const getMessageBrokerStatus = (_req: Request, res: Response) => {
  return res.json({
    data: getMessageBrokerHealth()
  });
};

export const getNotificationHealth = (_req: Request, res: Response) => {
  return res.json(getNotificationServiceHealth());
};

export const listNotificationEvents = (_req: Request, res: Response) => {
  return res.json({
    data: listNotificationRecords()
  });
};
