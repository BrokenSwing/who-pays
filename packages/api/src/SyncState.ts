import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
import type { EncodedEvent } from "@who-pays/shared"

type Callback = (events: ReadonlyArray<EncodedEvent>) => Effect.Effect<void>

export class SyncState extends Effect.Service<SyncState>()("SyncState", {
  effect: Effect.gen(function* () {
    const subscribers = yield* Ref.make(new Map<string, Set<Callback>>())

    const subscribe = (storeId: string, onEvents: Callback) =>
      Effect.acquireRelease(
        Ref.update(subscribers, (map) => {
          const next = new Map(map)
          if (!next.has(storeId)) next.set(storeId, new Set())
          next.get(storeId)!.add(onEvents)
          return next
        }).pipe(Effect.as(onEvents)),
        (cb) =>
          Ref.update(subscribers, (map) => {
            const next = new Map(map)
            next.get(storeId)?.delete(cb)
            return next
          })
      )

    const broadcast = (storeId: string, events: ReadonlyArray<EncodedEvent>, exclude?: Callback) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(subscribers)
        const set = map.get(storeId)
        if (!set) return
        const callbacks = [...set].filter((cb) => cb !== exclude)
        yield* Effect.all(
          callbacks.map((cb) => cb(events)),
          { concurrency: "unbounded", discard: true }
        )
      })

    return { subscribe, broadcast }
  }),
}) {}
