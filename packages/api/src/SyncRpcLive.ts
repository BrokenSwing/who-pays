import { SyncRpcs, type EncodedEvent } from "@who-pays/shared"
import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"
import { EventLog } from "./EventLog.ts"
import { SyncState } from "./SyncState.ts"

export const syncHandlers = SyncRpcs.toLayer({
  Push: ({ storeId, events }) =>
    Effect.gen(function* () {
      const eventLog = yield* EventLog
      const syncState = yield* SyncState
      yield* eventLog.ensureStore(storeId)
      yield* eventLog.append(storeId, events)
      yield* syncState.broadcast(storeId, events)
    }).pipe(Effect.mapError((e) => String(e))),

  Pull: ({ storeId, afterGlobalSeq }) =>
    Stream.unwrapScoped(
      Effect.gen(function* () {
        const eventLog = yield* EventLog
        const syncState = yield* SyncState

        yield* eventLog.ensureStore(storeId)

        type Batch = { batch: ReadonlyArray<EncodedEvent>; remaining: number }
        const queue = yield* Queue.unbounded<Batch>()

        yield* syncState.subscribe(storeId, (newEvents) =>
          Queue.offer(queue, { batch: newEvents, remaining: 0 })
        )

        const historical = yield* eventLog.getEvents(storeId, afterGlobalSeq)

        const historicalStream: Stream.Stream<Batch> =
          historical.length > 0
            ? Stream.make({ batch: historical, remaining: 0 })
            : Stream.empty

        const liveStream: Stream.Stream<Batch> = Stream.fromQueue(queue)

        return Stream.concat(historicalStream, liveStream)
      }).pipe(Effect.mapError((e) => String(e)))
    ),
})
