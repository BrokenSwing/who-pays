import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Logo } from "../components/Logo"
import { Field } from "../components/Field"
import { listGroups } from "../storage"
import { ChevronRight, Plus } from "lucide-react"

export const Route = createFileRoute("/")({
  component: Landing,
})

function Landing() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState("")
  const groups = listGroups()

  function createGroup() {
    const token = crypto.randomUUID()
    navigate({ to: "/g/$groupToken", params: { groupToken: token } })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-13 flex items-center gap-3">
          <Logo className="w-7 h-7 shrink-0" />
          <span className="text-base font-semibold text-foreground">Who Pays?</span>
        </div>
      </header>

      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-6 flex-1">
        {/* Existing groups */}
        {groups.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Your groups</h2>
            <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
              {groups.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => navigate({ to: "/g/$groupToken", params: { groupToken: g.id } })}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left ${i < groups.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="text-sm font-medium text-foreground">{g.name}</span>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Create group */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className={groups.length === 0 ? "btn-primary w-full" : "btn-outline w-full gap-2"}
          >
            <Plus size={15} />
            {groups.length === 0 ? "Create your first group" : "Create new group"}
          </button>
        ) : (
          <section className="rounded-lg border border-border bg-card shadow-xs p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">New group</h2>
            <Field label="Group name">
              <input
                autoFocus
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createGroup()}
                placeholder="Weekend trip, Roommates…"
                className="input"
              />
            </Field>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="btn-ghost text-muted-foreground">
                Cancel
              </button>
              <button onClick={createGroup} className="btn-primary">
                Create
              </button>
            </div>
          </section>
        )}

        {groups.length === 0 && !showCreate && (
          <p className="text-center text-sm text-muted-foreground">
            Have a link? Paste it in your browser.
          </p>
        )}
      </div>
    </div>
  )
}
