import { useQuery, useStore } from "@livestore/react"
import { queryDb, nanoid } from "@livestore/livestore"
import { events, tables } from "@who-pays/shared"
import { useState, type ReactNode } from "react"

const groupQuery$ = queryDb(tables.groups.first({ fallback: () => null }))
const membersQuery$ = queryDb(tables.members.where({ deletedAt: null }))

// ── Create form (new group) ──────────────────────────────────────────────────

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
  const [otherNames, setOtherNames] = useState<string[]>([""])

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
      ...others.map((name) =>
        events.memberAdded({ id: nanoid(), groupId: groupToken, name })
      ),
    )

    onCreated(youId)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create group</h1>
          <p className="text-sm text-gray-500 mt-1">Set up your group and add the people splitting expenses.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Weekend trip, Roommates…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="Alice"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Other members</label>
          <div className="space-y-2">
            {otherNames.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateRow(i, e.target.value)}
                  placeholder="Name"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeRow(i)}
                  className="text-gray-400 hover:text-red-500 px-2"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add member
          </button>
        </div>

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
        >
          Create group
        </button>
      </div>
    </div>
  )
}

// ── Join form (existing group, unknown visitor) ──────────────────────────────

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

  function selectExisting(id: string) {
    onJoined(id)
  }

  function joinAsNew() {
    const name = newName.trim()
    if (!name) { alert("Enter your name"); return }
    const id = nanoid()
    store.commit(events.memberAdded({ id, groupId: groupToken, name }))
    onJoined(id)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Who are you?</h1>
          <p className="text-sm text-gray-500 mt-1">Pick your name to see your share of expenses.</p>
        </div>

        <div className="space-y-2">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => selectExisting(m.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-800 font-medium"
            >
              {m.name}
            </button>
          ))}
        </div>

        {!showNewName ? (
          <button
            onClick={() => setShowNewName(true)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={joinAsNew}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Join group
            </button>
          </div>
        )}
      </div>
    </div>
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

  if (currentMemberId === null) {
    return <JoinForm groupToken={groupToken} members={members} onJoined={onMemberSelected} />
  }

  return <>{children}</>
}
