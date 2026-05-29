import { SyncRpcs, KNOWN_EVENT_NAMES, type EncodedEvent } from "@who-pays/shared";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import { EventLog } from "./EventLog.ts";
import { SyncState } from "./SyncState.ts";

const MAX_QUEUE_DEPTH = 2000;

function sanitizeError(context: string, e: unknown): string {
  Effect.logError(`[${context}]`, e);
  return context === "Push" ? "Push failed" : "Pull failed";
}

function validateEventNames(events: ReadonlyArray<EncodedEvent>): Effect.Effect<void, string> {
  for (const event of events) {
    if (!KNOWN_EVENT_NAMES.has(event.name)) {
      return Effect.fail(`Unknown event name: ${event.name}`);
    }
  }
  return Effect.void;
}

export const syncHandlers = SyncRpcs.toLayer({
  Push: ({ storeId, events }) =>
    Effect.gen(function* () {
      const eventLog = yield* EventLog;
      const syncState = yield* SyncState;
      yield* validateEventNames(events);
      const validatedId = yield* eventLog.ensureStore(storeId);
      yield* eventLog.append(validatedId, events);
      yield* syncState.broadcast(validatedId, events);
    }).pipe(Effect.mapError((e) => (typeof e === "string" ? e : sanitizeError("Push", e)))),

  Pull: ({ storeId, afterGlobalSeq }) =>
    Stream.unwrapScoped(
      Effect.gen(function* () {
        const eventLog = yield* EventLog;
        const syncState = yield* SyncState;

        const validatedId = yield* eventLog.ensureStore(storeId);

        type Batch = { batch: ReadonlyArray<EncodedEvent>; remaining: number };
        const queue = yield* Queue.dropping<Batch>(MAX_QUEUE_DEPTH);

        yield* syncState.subscribe(validatedId, (newEvents) =>
          Queue.offer(queue, { batch: newEvents, remaining: 0 }),
        );

        const historical = yield* eventLog.getEvents(validatedId, afterGlobalSeq);

        const historicalStream: Stream.Stream<Batch> =
          historical.length > 0 ? Stream.make({ batch: historical, remaining: 0 }) : Stream.empty;

        const liveStream: Stream.Stream<Batch> = Stream.fromQueue(queue);

        return Stream.concat(historicalStream, liveStream);
      }).pipe(Effect.mapError((e) => (typeof e === "string" ? e : sanitizeError("Pull", e)))),
    ),
});
