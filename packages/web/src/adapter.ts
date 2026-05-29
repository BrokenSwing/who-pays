import { makePersistedAdapter } from "@livestore/adapter-web"
import LiveStoreWorker from "./livestore.worker?worker"
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker"

export const adapter = makePersistedAdapter({
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
  storage: { type: "opfs" },
})
