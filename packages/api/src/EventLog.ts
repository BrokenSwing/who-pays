import { SqlClient } from "@effect/sql/SqlClient"
import * as SqliteClient from "@effect/sql-sqlite-node/SqliteClient"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { EncodedEvent } from "@who-pays/shared"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function tableName(storeId: string): string {
  return `eventlog_${storeId.replace(/-/g, "_")}`
}

export class EventLog extends Effect.Service<EventLog>()("EventLog", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient

    const ensureStore = (storeId: string) =>
      Effect.gen(function* () {
        if (!UUID_PATTERN.test(storeId)) {
          return yield* Effect.fail(new Error(`Invalid storeId: ${storeId}`))
        }
        const tbl = tableName(storeId)
        yield* sql.unsafe(
          `CREATE TABLE IF NOT EXISTS "${tbl}" (seq INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000))`
        )
      })

    const append = (storeId: string, events: readonly EncodedEvent[]) =>
      Effect.gen(function* () {
        const tbl = tableName(storeId)
        for (const event of events) {
          yield* sql.unsafe(`INSERT INTO "${tbl}" (data) VALUES (?)`, [JSON.stringify(event)])
        }
      })

    const getEvents = (storeId: string, afterGlobalSeq: number) =>
      Effect.gen(function* () {
        const tbl = tableName(storeId)
        const rows = yield* sql.unsafe(
          `SELECT data FROM "${tbl}" WHERE seq > ? ORDER BY seq ASC`,
          [afterGlobalSeq]
        )
        return rows.map((row: any) => JSON.parse(row.data) as EncodedEvent)
      })

    return { ensureStore, append, getEvents }
  }),
}) {}

export const EventLogLayer = Layer.provide(
  EventLog.Default,
  SqliteClient.layer({ filename: process.env.DATABASE_URL ?? "./data/events.db" })
)
