import { useQuery, useStore } from "@livestore/react"
import { queryDb, nanoid } from "@livestore/livestore"
import { events, tables } from "@who-pays/shared"
import { useState, type ReactNode } from "react"
import { Logo } from "./Logo"
import { Field } from "./Field"
import { X, Plus } from "lucide-react"

const groupQuery$ = queryDb(tables.groups.first({ fallback: () => null }))
const membersQuery$ = queryDb(tables.members.where({ deletedAt: null }))

// ── Shared card shell ────────────────────────────────────────────────────────

function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-xl shadow-md ring-1 ring-border p-8 w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9 shrink-0" />
          <h1 className="text-lg font-semibold text-foreground">Who Pays?</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Create form ──────────────────────────────────────────────────────────────

function CreateGroupForm({
  groupToken,
  onCreated,
}: {
  groupToken: string
  onCreated: (memberId: string) => void
}) {
  const { store } = useStore()
  const [groupName, setGroupName] = useState("")
  const [yourName, setYourName] = useState("")
  const [otherNames, setOtherNames] = useState<string[]>([])

  function addRow() {
    setOtherNames((prev) => [...prev, ""])
  }

  function updateRow(i: number, value: string) {
    setOtherNames((prev) => prev.map((n, j) => (j === i ? value : n)))
  }

  function removeRow(i: number) {
    setOtherNames((prev) => prev.filter((_, j) => j !== i))
  }

  function submit() {
    const trimmedGroup = groupName.trim()
    const trimmedYou = yourName.trim()
    if (!trimmedGroup) { alert("Group name is required"); return }
    if (!trimmedYou) { alert("Your name is required"); return }

    const youId = nanoid()
    const others = otherNames.map((n) => n.trim()).filter(Boolean)

    store.commit(
      events.groupCreated({ id: groupToken, name: trimmedGroup, defaultCurrency: "EUR" }),
      events.memberAdded({ id: youId, groupId: groupToken, name: trimmedYou }),
      ...others.map((name) => events.memberAdded({ id: nanoid(), groupId: groupToken, name })),
    )

    onCreated(youId)
  }

  return (
    <OnboardingShell>
      <div>
        <p className="text-sm font-medium text-foreground">Create a group</p>
        <p className="text-sm text-muted-foreground mt-0.5">Add the people splitting expenses.</p>
      </div>

      <div className="space-y-4">
        <Field label="Group name">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Weekend trip, Roommates…"
            className="input"
          />
        </Field>

        <Field label="Your name">
          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="Alice"
            className="input"
          />
        </Field>

        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Other members</span>
          {otherNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateRow(i, e.target.value)}
                placeholder="Name"
                className="input"
              />
              <button
                onClick={() => removeRow(i)}
                className="btn-ghost px-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button onClick={addRow} className="btn-outline w-full gap-1.5">
            <Plus size={15} />
            Add member
          </button>
        </div>
      </div>

      <button onClick={submit} className="btn-primary w-full">
        Create group
      </button>
    </OnboardingShell>
  )
}

// ── Join form ────────────────────────────────────────────────────────────────

type Member = { id: string; name: string }

function JoinForm({
  groupToken,
  members,
  onJoined,
}: {
  groupToken: string
  members: readonly Member[]
  onJoined: (memberId: string) => void
}) {
  const { store } = useStore()
  const [newName, setNewName] = useState("")
  const [showNewName, setShowNewName] = useState(false)

  function joinAsNew() {
    const name = newName.trim()
    if (!name) { alert("Enter your name"); return }
    const id = nanoid()
    store.commit(events.memberAdded({ id, groupId: groupToken, name }))
    onJoined(id)
  }

  return (
    <OnboardingShell>
      <div>
        <p className="text-sm font-medium text-foreground">Who are you?</p>
        <p className="text-sm text-muted-foreground mt-0.5">Pick your name to see your share.</p>
      </div>

      <div className="space-y-1.5">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => onJoined(m.id)}
            className="w-full text-left px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-transparent transition-colors text-sm font-medium"
          >
            {m.name}
          </button>
        ))}
      </div>

      {!showNewName ? (
        <button
          onClick={() => setShowNewName(true)}
          className="btn-ghost w-full text-muted-foreground"
        >
          I'm not listed — add me
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinAsNew()}
            placeholder="Your name"
            autoFocus
            className="input"
          />
          <button onClick={joinAsNew} className="btn-primary w-full">
            Join group
          </button>
        </div>
      )}
    </OnboardingShell>
  )
}

// ── Gate ─────────────────────────────────────────────────────────────────────

export function GroupInit({
  groupToken,
  currentMemberId,
  onMemberSelected,
  children,
}: {
  groupToken: string
  currentMemberId: string | null
  onMemberSelected: (id: string) => void
  children: ReactNode
}) {
  const group = useQuery(groupQuery$)
  const members = useQuery(membersQuery$)

  if (group === null) {
    return <CreateGroupForm groupToken={groupToken} onCreated={onMemberSelected} />
  }

  const memberExists = currentMemberId !== null && members.some((m) => m.id === currentMemberId)

  if (!memberExists) {
    return <JoinForm groupToken={groupToken} members={members} onJoined={onMemberSelected} />
  }

  return <>{children}</>
}
