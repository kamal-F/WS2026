import { randomUUID } from "node:crypto";
import { connect } from "amqplib";
import type { Channel, ChannelModel, ConsumeMessage } from "amqplib";

export type DomainEvent<TPayload = Record<string, unknown>> = {
  id: string;
  type: string;
  source: string;
  occurredAt: string;
  payload: TPayload;
};

type DomainEventHandler = (event: DomainEvent) => Promise<void> | void;

type MessageBrokerTransport = "in-memory" | "rabbitmq";

type BrokerStatus = "ready" | "connected" | "fallback";

const subscribers = new Map<string, DomainEventHandler[]>();
const pendingJobs = new Set<Promise<void>>();

let transport: MessageBrokerTransport = "in-memory";
let status: BrokerStatus = "ready";
let lastError: string | null = null;
let initialized = false;
let connectionPromise: Promise<void> | null = null;
let rabbitConnection: ChannelModel | null = null;
let rabbitChannel: Channel | null = null;

const getQueueName = () => {
  return process.env.RABBITMQ_QUEUE ?? "ws2026.book.events";
};

const getRabbitMqUrl = () => {
  const forcedTransport = process.env.MESSAGE_BROKER_TRANSPORT;

  if (forcedTransport === "in-memory") {
    return undefined;
  }

  return process.env.RABBITMQ_URL;
};

const trackJob = (job: Promise<void>) => {
  pendingJobs.add(job);
  void job.finally(() => {
    pendingJobs.delete(job);
  });
};

const getHandlers = (eventType: string) => {
  return subscribers.get(eventType) ?? [];
};

const dispatchEventToSubscribers = async (event: DomainEvent) => {
  const handlers = getHandlers(event.type);

  for (const handler of handlers) {
    await handler(event);
  }
};

const handleRabbitMessage = (message: ConsumeMessage | null) => {
  if (!message || !rabbitChannel) {
    return;
  }

  const event = JSON.parse(message.content.toString("utf8")) as DomainEvent;
  const job = dispatchEventToSubscribers(event)
    .then(() => {
      rabbitChannel?.ack(message);
    })
    .catch((error: Error) => {
      lastError = error.message;
      rabbitChannel?.nack(message, false, false);
    });

  trackJob(job);
};

export const initializeMessageBroker = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  if (getRabbitMqUrl()) {
    void ensureMessageBrokerReady();
    return;
  }

  transport = "in-memory";
  status = "ready";
};

export const ensureMessageBrokerReady = async () => {
  const rabbitMqUrl = getRabbitMqUrl();

  if (!rabbitMqUrl) {
    transport = "in-memory";
    status = "ready";
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      rabbitConnection = await connect(rabbitMqUrl);
      const channel = await rabbitConnection.createChannel();
      await channel.assertQueue(getQueueName(), { durable: false });
      await channel.consume(getQueueName(), handleRabbitMessage);
      rabbitChannel = channel;
      transport = "rabbitmq";
      status = "connected";
      lastError = null;
    } catch (error) {
      transport = "in-memory";
      status = "fallback";
      lastError = error instanceof Error ? error.message : "Koneksi RabbitMQ gagal";
    }
  })();

  return connectionPromise;
};

export const subscribeToDomainEvent = (
  eventType: string,
  handler: DomainEventHandler
) => {
  const current = subscribers.get(eventType) ?? [];
  subscribers.set(eventType, [...current, handler]);
};

export const publishDomainEvent = async <TPayload extends Record<string, unknown>>(
  type: string,
  source: string,
  payload: TPayload
) => {
  await ensureMessageBrokerReady();

  const event: DomainEvent<TPayload> = {
    id: randomUUID(),
    type,
    source,
    occurredAt: new Date().toISOString(),
    payload
  };

  if (transport === "rabbitmq" && rabbitChannel) {
    rabbitChannel.sendToQueue(getQueueName(), Buffer.from(JSON.stringify(event)));
    return event;
  }

  const job = Promise.resolve().then(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    await dispatchEventToSubscribers(event);
  });

  trackJob(job);

  return event;
};

export const getMessageBrokerHealth = () => {
  return {
    status,
    transport,
    queueName: getQueueName(),
    subscribers: [...subscribers.values()].reduce((total, items) => total + items.length, 0),
    pendingJobs: pendingJobs.size,
    lastError
  };
};

export const waitForMessageBrokerIdle = async () => {
  while (pendingJobs.size > 0) {
    await Promise.all([...pendingJobs]);
  }
};
