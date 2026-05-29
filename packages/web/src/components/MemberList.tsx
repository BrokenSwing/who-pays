import type { Store } from "@livestore/livestore"
import { events } from "@who-pays/shared"
import { nanoid } from "@livestore/livestore"
import { useState } from "react"
import { Plus, X } from "lucide-react"

type Member = { id: string; name: string; deletedAt: Date | null }

export function MemberList({
  members,
  store,
  groupToken,
}: {
  members: readonly Member[]
  store: Store
  groupToken: string
}) {
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  function addMember() {
    if (!newName.trim()) return
    store.commit(events.memberAdded({ id: nanoid(), groupId: groupToken, name: newName.trim() }))
    setNewName("")
    setAdding(false)
  }

  function removeMember(id: string) {
    store.commit(events.memberRemoved({ id }))
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Members</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-ghost h-7 px-2 text-muted-foreground">
            <Plus size={15} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium"
          >
            {m.name}
            <button
              onClick={() => removeMember(m.id)}
              className="text-secondary-foreground/50 hover:text-destructive transition-colors"
              aria-label={`Remove ${m.name}`}
            >
              <X size={13} />
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
              if (e.key === "Enter") addMember()
              if (e.key === "Escape") setAdding(false)
            }}
            placeholder="Name"
            className="input"
          />
          <button onClick={addMember} className="btn-primary shrink-0">
            Add
          </button>
          <button onClick={() => setAdding(false)} className="btn-ghost shrink-0 px-2 text-muted-foreground">
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  )
}
