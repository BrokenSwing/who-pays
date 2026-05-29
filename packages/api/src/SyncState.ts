import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
import type { EncodedEvent } from "@who-pays/shared"
import type { ValidatedStoreId } from "./EventLog.ts"

type Callback = (events: ReadonlyArray<EncodedEvent>) => Effect.Effect<void>

const MAX_SUBSCRIBERS_PER_STORE = 200
const BROADCAST_CONCURRENCY = 50

export class SyncState extends Effect.Service<SyncState>()("SyncState", {
  effect: Effect.gen(function* () {
    const subscribers = yield* Ref.make(new Map<string, Set<Callback>>())

    const subscribe = (storeId: ValidatedStoreId, onEvents: Callback) =>
      Effect.acquireRelease(
        Effect.gen(function* () {
          yield* Ref.update(subscribers, (map) => {
            const next = new Map(map)
            if (!next.has(storeId)) next.set(storeId, new Set())
            const set = next.get(storeId)!
            if (set.size >= MAX_SUBSCRIBERS_PER_STORE) return map
            set.add(onEvents)
            return next
          })
          return onEvents
        }),
        (cb) =>
          Ref.update(subscribers, (map) => {
            const next = new Map(map)
            next.get(storeId)?.delete(cb)
            return next
          })
      )

    const broadcast = (storeId: ValidatedStoreId, events: ReadonlyArray<EncodedEvent>, exclude?: Callback) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(subscribers)
        const set = map.get(storeId)
        if (!set) return
        const callbacks = [...set].filter((cb) => cb !== exclude)
        yield* Effect.all(
          callbacks.map((cb) => cb(events)),
          { concurrency: BROADCAST_CONCURRENCY, discard: true }
        )
      })

    return { subscribe, broadcast }
  }),
}) {}
