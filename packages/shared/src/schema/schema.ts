import { makeSchema, State } from "@livestore/livestore";
import { events } from "./events.ts";
import { tables } from "./tables.ts";
import { appMaterializers } from "./materializers.ts";

export { events, tables };

export const schema = makeSchema({
  events,
  state: State.SQLite.makeState({
    tables,
    materializers: appMaterializers,
  }),
});
