import { useQuery, useStore } from "@livestore/react";
import { queryDb } from "@livestore/livestore";
import { events, tables } from "@who-pays/shared";
import { nanoid } from "@livestore/livestore";
import { useEffect } from "react";

const groupQuery$ = queryDb(tables.groups.first({ fallback: () => null }));

export function GroupInit({ groupToken, groupName }: { groupToken: string; groupName?: string }) {
  const group = useQuery(groupQuery$);
  const { store } = useStore();

  useEffect(() => {
    if (group === null) {
      store.commit(
        events.groupCreated({
          id: groupToken,
          name: groupName ?? "My Group",
          defaultCurrency: "EUR",
        }),
      );
    }
  }, [group, groupToken, groupName, store]);

  return null;
}
