import { subscribeToDomainEvent, type DomainEvent } from "./message-broker.js";

type NotificationRecord = {
  id: string;
  eventType: string;
  source: string;
  handledBy: string;
  receivedAt: string;
  payloadSummary: string;
};

const notificationRecords: NotificationRecord[] = [];

let initialized = false;

const summarizePayload = (event: DomainEvent) => {
  if (event.type === "book.created") {
    const payload = event.payload as {
      title?: string;
      author?: string;
      triggeredBy?: string;
    };

    return `Buku "${payload.title ?? "-"}" oleh ${payload.author ?? "-"} dibuat oleh ${payload.triggeredBy ?? "system"}`;
  }

  return JSON.stringify(event.payload);
};

export const initializeNotificationConsumer = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  subscribeToDomainEvent("book.created", async (event) => {
    notificationRecords.unshift({
      id: event.id,
      eventType: event.type,
      source: event.source,
      handledBy: "notification-service",
      receivedAt: new Date().toISOString(),
      payloadSummary: summarizePayload(event)
    });

    if (notificationRecords.length > 20) {
      notificationRecords.length = 20;
    }
  });
};

export const getNotificationServiceHealth = () => {
  return {
    status: "ok" as const,
    service: "notification-service",
    boundedContext: "event-consumer"
  };
};

export const getNotificationServiceDescriptor = () => {
  return {
    name: "notification-service",
    kind: "domain-service" as const,
    basePath: "/services/notifications",
    healthPath: "/services/notifications/health",
    responsibilities: [
      "Mengonsumsi event dari message broker",
      "Membuat log notifikasi dari event book.created",
      "Menunjukkan pola producer-consumer"
    ],
    integrations: ["RabbitMQ atau in-memory broker", "catalog-service producer"]
  };
};

export const listNotificationRecords = () => {
  return [...notificationRecords];
};

export const resetNotificationRecords = () => {
  notificationRecords.length = 0;
};
