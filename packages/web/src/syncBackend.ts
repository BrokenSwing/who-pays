import type { SyncBackend, SyncBackendConstructor } from "@livestore/common";
import { UnexpectedError } from "@livestore/common";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as Socket from "@effect/platform/Socket";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { SyncRpcs } from "@who-pays/shared";

export const makeSyncBackend: SyncBackendConstructor = ({ storeId }) =>
  Effect.gen(function* () {
    const protocolLayer = RpcClient.layerProtocolSocket({ retryTransientErrors: true }).pipe(
      Layer.provide(RpcSerialization.layerJson),
      Layer.provide(Socket.layerWebSocket("/rpc")),
      Layer.provide(Socket.layerWebSocketConstructorGlobal),
    );

    const client = yield* RpcClient.make(SyncRpcs).pipe(Effect.provide(protocolLayer));

    const isConnected = yield* SubscriptionRef.make(true);

    const backend: SyncBackend = {
      connect: Effect.void as any,
      pull: (cursor) => {
        const afterGlobalSeq = Option.match(cursor, {
          onNone: () => 0,
          onSome: ({ cursor: c }) => c.global as number,
        });
        return client.Pull({ storeId, afterGlobalSeq }).pipe(
          Stream.map(({ batch, remaining }) => ({
            batch: batch.map((event) => ({
              eventEncoded: event as any,
              metadata: Option.none(),
            })),
            remaining,
          })),
        ) as any;
      },
      push: (batch) => client.Push({ storeId, events: batch as any }) as any,
      isConnected,
      metadata: { name: "who-pays-rpc", description: "Effect RPC WebSocket sync" },
    };

    return backend;
  }).pipe(Effect.mapError((e) => new UnexpectedError({ cause: e })));
