import { makeWorker } from "@livestore/adapter-web/worker";
import { schema } from "@who-pays/shared";
import { makeSyncBackend } from "./syncBackend";

makeWorker({ schema, sync: { backend: makeSyncBackend } });
