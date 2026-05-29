import type { Store } from "@livestore/livestore";
import { events } from "@who-pays/shared";
import { nanoid } from "@livestore/livestore";
import { useState } from "react";

type Member = { id: string; name: string; deletedAt: Date | null };

export function MemberList({
  members,
  store,
  groupToken,
}: {
  members: readonly Member[];
  store: Store;
  groupToken: string;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  function addMember() {
    if (!newName.trim()) return;
    store.commit(events.memberAdded({ id: nanoid(), groupId: groupToken, name: newName.trim() }));
    setNewName("");
    setAdding(false);
  }

  function removeMember(id: string) {
    store.commit(events.memberRemoved({ id }));
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-gray-800">Members</h2>
        <button onClick={() => setAdding(true)} className="text-sm text-blue-600 hover:underline">
          + Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm"
          >
            {m.name}
            <button
              onClick={() => removeMember(m.id)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
              aria-label={`Remove ${m.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addMember();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Name"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addMember}
            className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-700"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            className="text-gray-400 text-sm px-2 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
