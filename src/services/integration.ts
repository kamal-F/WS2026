import { findBookById } from "./books.js";
import { replayStream } from "./event-stream.js";
import { getBookSummaryViaGrpc } from "./grpc-catalog.js";
import { listNotificationRecords } from "./notification-service.js";

export const buildIntegratedBookOverview = async (id: string) => {
  const restBook = findBookById(id);

  if (!restBook) {
    return null;
  }

  const rpcView = await getBookSummaryViaGrpc(id);
  const streamRecords = replayStream("book-events", 0).records.filter((record) => record.key === id);
  const notifications = listNotificationRecords().filter((record) =>
    record.payloadSummary.includes(restBook.title)
  );

  return {
    gateway: "ws2026-api-gateway",
    bookId: id,
    restView: restBook,
    rpcView,
    streamView: {
      topic: "book-events",
      records: streamRecords
    },
    notifications
  };
};
