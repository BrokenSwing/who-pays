import type { Store } from "@livestore/livestore"
import { nanoid } from "@livestore/livestore"
import { events } from "@who-pays/shared"
import type { MemberBalance, Transfer } from "@who-pays/shared"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Plus, X, ArrowRight, MoreVertical, Pencil, UserCheck, Trash2 } from "lucide-react"
import { useCurrentMember } from "../context"

type Member = { id: string; name: string; deletedAt: Date | null }

// ── Portal dropdown ──────────────────────────────────────────────────────────

type MenuItem =
  | { type: "item"; label: string; icon: React.ReactNode; onClick: () => void; variant?: "danger" }
  | { type: "separator" }

function DropdownMenu({
  anchorRef,
  items,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  items: MenuItem[]
  onClose: () => void
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
  }, [])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const menu = document.getElementById("who-pays-dropdown")
      if (menu && !menu.contains(e.target as Node)) onClose()
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [onClose])

  return createPortal(
    <div
      id="who-pays-dropdown"
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 50 }}
      className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-40"
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <div key={i} className="my-1 border-t border-border" />
        }
        return (
          <button
            key={i}
            onClick={() => { item.onClick(); onClose() }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              item.variant === "danger"
                ? "text-destructive hover:bg-destructive/10"
                : "text-foreground hover:bg-muted/40"
            }`}
          >
            <span className={item.variant === "danger" ? "text-destructive" : "text-muted-foreground"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}

// ── Per-member row ───────────────────────────────────────────────────────────

function MemberRow({
  member,
  net,
  showBalance,
  hasBorder,
  isCurrent,
  store,
  onSwitchToMe,
}: {
  member: Member
  net: number
  showBalance: boolean
  hasBorder: boolean
  isCurrent: boolean
  store: Store
  onSwitchToMe: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(member.name)
  const buttonRef = useRef<HTMLButtonElement>(null)

  function submitEdit() {
    const name = editName.trim()
    if (name && name !== member.name) {
      store.commit(events.memberRenamed({ id: member.id, name }))
    }
    setEditing(false)
  }

  const menuItems: MenuItem[] = [
    {
      type: "item",
      label: "Edit name",
      icon: <Pencil size={13} />,
      onClick: () => { setEditName(member.name); setEditing(true) },
    },
    ...(!isCurrent ? [{
      type: "item" as const,
      label: "This is me",
      icon: <UserCheck size={13} />,
      onClick: () => onSwitchToMe(member.id),
    }] : []),
    ...(!isCurrent ? [
      { type: "separator" as const },
      {
        type: "item" as const,
        label: "Remove",
        icon: <Trash2 size={13} />,
        variant: "danger" as const,
        onClick: () => store.commit(events.memberRemoved({ id: member.id })),
      },
    ] : []),
  ]

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 ${hasBorder ? "border-b border-border" : ""}`}>
      {editing ? (
        <input
          autoFocus
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={submitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitEdit()
            if (e.key === "Escape") setEditing(false)
          }}
          className="input flex-1 h-8"
        />
      ) : (
        <span className="flex-1 text-sm text-foreground truncate">
          {member.name}
          {isCurrent && <span className="text-xs text-muted-foreground ml-1.5">you</span>}
        </span>
      )}

      {showBalance && !editing && (
        <span className={`text-sm font-medium tabular-nums shrink-0 ${
          net > 0 ? "text-primary" : net < 0 ? "text-destructive" : "text-muted-foreground"
        }`}>
          {net > 0 ? "+" : ""}{net.toFixed(2)}
        </span>
      )}

      {!editing && (
        <>
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen((o) => !o)}
            className="btn-ghost h-7 w-7 p-0 text-muted-foreground shrink-0"
            aria-label={`Options for ${member.name}`}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <DropdownMenu
              anchorRef={buttonRef}
              items={menuItems}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function MembersCard({
  members,
  balances,
  transfers,
  store,
  groupToken,
}: {
  members: readonly Member[]
  balances: readonly MemberBalance[]
  transfers: readonly Transfer[]
  store: Store
  groupToken: string
}) {
  const { currentMemberId, setCurrentMemberId } = useCurrentMember()
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  const balanceByMember = new Map(balances.map((b) => [b.memberId, b.net]))
  const showTransfers = transfers.length > 0

  function addMember() {
    if (!newName.trim()) return
    store.commit(events.memberAdded({ id: nanoid(), groupId: groupToken, name: newName.trim() }))
    setNewName("")
    setAdding(false)
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Members</h2>

      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        {members.map((m, i) => (
          <MemberRow
            key={m.id}
            member={m}
            net={balanceByMember.get(m.id) ?? 0}
            showBalance={balances.length > 0}
            hasBorder={i < members.length - 1 || adding || showTransfers}
            isCurrent={m.id === currentMemberId}
            store={store}
            onSwitchToMe={setCurrentMemberId}
          />
        ))}

        {adding ? (
          <div className={`flex items-center gap-2 px-3 py-2 ${showTransfers ? "border-b border-border" : ""}`}>
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
              className="input flex-1"
            />
            <button onClick={addMember} className="btn-primary shrink-0">Add</button>
            <button
              onClick={() => setAdding(false)}
              className="btn-ghost h-9 w-9 p-0 text-muted-foreground shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 transition-colors ${showTransfers ? "border-b border-border" : ""}`}
          >
            <Plus size={14} />
            Add member
          </button>
        )}

        {showTransfers && (
          <>
            <div className="px-4 py-2 bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Settle up</span>
            </div>
            {transfers.map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 ${i < transfers.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-sm text-foreground flex items-center gap-1.5">
                  {t.fromMemberName}
                  <ArrowRight size={13} className="text-muted-foreground shrink-0" />
                  {t.toMemberName}
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}
