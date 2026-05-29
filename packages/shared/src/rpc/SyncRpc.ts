import * as Rpc from "@effect/rpc/Rpc"
import * as RpcGroup from "@effect/rpc/RpcGroup"
import * as Schema from "effect/Schema"

// Matches AnyEncodedGlobal from @livestore/common — JSON-serializable
export const EncodedEvent = Schema.Struct({
  name: Schema.String,
  args: Schema.Any,
  seqNum: Schema.Number,
  parentSeqNum: Schema.Number,
  clientId: Schema.String,
  sessionId: Schema.String,
})
export type EncodedEvent = typeof EncodedEvent.Type

export const SyncBatch = Schema.Struct({
  batch: Schema.Array(EncodedEvent),
  remaining: Schema.Number,
})
export type SyncBatch = typeof SyncBatch.Type

export class SyncRpcs extends RpcGroup.make(
  Rpc.make("Push", {
    payload: {
      storeId: Schema.String,
      events: Schema.Array(EncodedEvent),
    },
    success: Schema.Void,
    error: Schema.String,
  }),
  Rpc.make("Pull", {
    payload: {
      storeId: Schema.String,
      afterGlobalSeq: Schema.Number,
    },
    success: SyncBatch,
    error: Schema.String,
    stream: true,
  })
) {}
