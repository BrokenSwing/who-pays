import * as http from "node:http"
import * as fs from "node:fs"
import { SyncRpcs } from "@who-pays/shared"
import { NodeHttpServer, NodeContext, NodeRuntime } from "@effect/platform-node"
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter"
import * as RpcSerialization from "@effect/rpc/RpcSerialization"
import * as RpcServer from "@effect/rpc/RpcServer"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { EventLogLayer } from "./EventLog.ts"
import { SyncState } from "./SyncState.ts"
import { syncHandlers } from "./SyncRpcLive.ts"

const PORT = Number(process.env.PORT ?? 3000)

fs.mkdirSync("./data", { recursive: true })

const HandlerLayer = Layer.mergeAll(syncHandlers).pipe(
  Layer.provide(EventLogLayer),
  Layer.provide(SyncState.Default)
)

const InfraLayer = RpcSerialization.layerJson

const RpcLayer = RpcServer.layerHttpRouter({
  group: SyncRpcs,
  path: "/rpc",
  protocol: "websocket",
}).pipe(
  Layer.provide(HandlerLayer),
  Layer.provide(InfraLayer)
)

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173"

const AppLayer = Layer.mergeAll(
  RpcLayer,
  HttpLayerRouter.cors({ allowedOrigins: [ALLOWED_ORIGIN] })
)

const ServerLayer = HttpLayerRouter.serve(AppLayer).pipe(
  Layer.provide(NodeHttpServer.layer(() => http.createServer(), { port: PORT })),
  Layer.provide(NodeContext.layer)
)

const program = Layer.launch(ServerLayer).pipe(
  Effect.tap(() => Effect.log(`Sync server listening on ws://localhost:${PORT}/rpc`))
)

NodeRuntime.runMain(program)
