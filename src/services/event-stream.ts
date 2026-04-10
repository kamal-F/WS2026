import { subscribeToDomainEvent, type DomainEvent } from "./message-broker.js";

type StreamRecord = {
  offset: number;
  topic: string;
  key: string;
  eventId: string;
  eventType: string;
  source: string;
  appendedAt: string;
  payload: Record<string, unknown>;
};

type StreamReplayResult = {
  topic: string;
  fromOffset: number;
  nextOffset: number;
  records: StreamRecord[];
};

const streamTopics = new Map<string, StreamRecord[]>();

let initialized = false;
let nextOffset = 0;

const resolveTopicFromEvent = (event: DomainEvent) => {
  if (event.type === "book.created") {
    return "book-events";
  }

  return "default-events";
};

const resolveKeyFromEvent = (event: DomainEvent) => {
  const payload = event.payload as { bookId?: string };
  return payload.bookId ?? event.id;
};

const appendToStream = (event: DomainEvent) => {
  const topic = resolveTopicFromEvent(event);
  const current = streamTopics.get(topic) ?? [];

  const record: StreamRecord = {
    offset: nextOffset,
    topic,
    key: resolveKeyFromEvent(event),
    eventId: event.id,
    eventType: event.type,
    source: event.source,
    appendedAt: new Date().toISOString(),
    payload: event.payload
  };

  nextOffset += 1;
  current.push(record);
  streamTopics.set(topic, current);

  return record;
};

export const initializeEventStreamConsumer = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  subscribeToDomainEvent("book.created", async (event) => {
    appendToStream(event);
  });
};

export const getEventStreamHealth = () => {
  return {
    status: "ok" as const,
    service: "event-stream-service",
    boundedContext: "event-streaming",
    mode: "kafka-style append-only log",
    totalTopics: streamTopics.size,
    totalRecords: [...streamTopics.values()].reduce((sum, items) => sum + items.length, 0),
    nextOffset
  };
};

export const getEventStreamDescriptor = () => {
  return {
    name: "event-stream-service",
    kind: "stream-service" as const,
    basePath: "/services/streaming",
    healthPath: "/services/streaming/health",
    responsibilities: [
      "Menyimpan event sebagai append-only log",
      "Menyediakan replay berdasarkan offset",
      "Menunjukkan konsep event streaming ala Kafka"
    ],
    integrations: ["message broker events", "consumer replay", "topic book-events"]
  };
};

export const listStreamTopics = () => {
  return [...streamTopics.entries()].map(([topic, records]) => ({
    topic,
    records: records.length,
    latestOffset: records.length > 0 ? records[records.length - 1].offset : null
  }));
};

export const replayStream = (topic: string, fromOffset = 0): StreamReplayResult => {
  const records = streamTopics.get(topic) ?? [];
  const replayRecords = records.filter((record) => record.offset >= fromOffset);

  return {
    topic,
    fromOffset,
    nextOffset,
    records: replayRecords
  };
};

export const resetEventStream = () => {
  streamTopics.clear();
  nextOffset = 0;
};
