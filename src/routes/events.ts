import { Router } from "express";
import {
  getMessageBrokerStatus,
  getNotificationHealth,
  listNotificationEvents
} from "../controllers/events.js";

export const eventsRouter = Router();
export const notificationsRouter = Router();

eventsRouter.get("/health", getMessageBrokerStatus);

notificationsRouter.get("/health", getNotificationHealth);
notificationsRouter.get("/events", listNotificationEvents);
