import type { Store } from "@livestore/livestore"
import { nanoid } from "@livestore/livestore"
import { events } from "@who-pays/shared"
import { useState, useEffect } from "react"
import { useAtomSet } from "@effect-atom/atom-react"
import { editingExpenseId } from "../atoms"
import { useCurrentMember } from "../context"
import { Field } from "./Field"
import { X } from "lucide-react"

type Member = { id: string; name: string }
type ExistingExpense = {
  id: string
  description: string
  amount: number
  currency: string
  exchangeRate: number
  paidByMemberId: string
  splitMode: string
  date: Date
} | null

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD"]
const SPLIT_MODES = [
  { value: "equal", label: "Equal" },
  { value: "percentage", label: "%" },
  { value: "exact", label: "Exact" },
  { value: "shares", label: "Shares" },
] as const

export function ExpenseForm({
  members,
  groupToken,
  store,
  existing,
  onClose,
}: {
  members: readonly Member[]
  groupToken: string
  store: Store
  existing: ExistingExpense
  onClose: () => void
}) {
  const setEditId = useAtomSet(editingExpenseId)
  const { currentMemberId } = useCurrentMember()
  const today = new Date().toISOString().slice(0, 10)

  const [description, setDescription] = useState(existing?.description ?? "")
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "")
  const [currency, setCurrency] = useState(existing?.currency ?? "EUR")
  const [exchangeRate, setExchangeRate] = useState(existing ? String(existing.exchangeRate) : "1")
  const [paidById, setPaidById] = useState(
    existing?.paidByMemberId ?? currentMemberId ?? members[0]?.id ?? "",
  )
  const [splitMode, setSplitMode] = useState<"equal" | "percentage" | "exact" | "shares">(
    (existing?.splitMode as any) ?? "equal",
  )
  const [date, setDate] = useState(
    existing
      ? existing.date instanceof Date
        ? existing.date.toISOString().slice(0, 10)
        : new Date(existing.date as any).toISOString().slice(0, 10)
      : today,
  )
  const [splits, setSplits] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    for (const m of members) defaults[m.id] = "1"
    return defaults
  })

  useEffect(() => {
    if (splitMode === "equal") {
      setSplits(() => {
        const s: Record<string, string> = {}
        for (const m of members) s[m.id] = "1"
        return s
      })
    } else if (splitMode === "percentage") {
      setSplits(() => {
        const pct = members.length > 0 ? String(Math.round(100 / members.length)) : "0"
        const s: Record<string, string> = {}
        for (const m of members) s[m.id] = pct
        return s
      })
    } else {
      setSplits((prev) => {
        const s: Record<string, string> = {}
        for (const m of members) s[m.id] = prev[m.id] ?? "0"
        return s
      })
    }
  }, [splitMode])

  function validate(): string | null {
    if (!description.trim()) return "Description is required"
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return "Amount must be positive"
    if (!paidById) return "Select who paid"
    if (splitMode === "percentage") {
      const total = Object.values(splits).reduce((s, v) => s + parseFloat(v || "0"), 0)
      if (Math.abs(total - 100) > 0.01)
        return `Percentages must sum to 100 (currently ${total.toFixed(1)})`
    }
    return null
  }

  function submit() {
    const err = validate()
    if (err) { alert(err); return }

    const parsedSplits = Object.entries(splits)
      .filter(([, v]) => parseFloat(v || "0") !== 0)
      .map(([memberId, value]) => ({ memberId, value: parseFloat(value) }))

    if (existing) {
      store.commit(
        events.expenseUpdated({
          id: existing.id,
          description: description.trim(),
          amount: parseFloat(amount),
          currency,
          exchangeRate: parseFloat(exchangeRate),
          paidByMemberId: paidById,
          splitMode,
          date: new Date(date).getTime(),
          splits: parsedSplits,
        }),
      )
      setEditId(null)
    } else {
      store.commit(
        events.expenseCreated({
          id: nanoid(),
          groupId: groupToken,
          description: description.trim(),
          amount: parseFloat(amount),
          currency,
          exchangeRate: parseFloat(exchangeRate),
          paidByMemberId: paidById,
          splitMode,
          date: new Date(date).getTime(),
          splits: parsedSplits,
        }),
      )
    }
    onClose()
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {existing ? "Edit expense" : "Add expense"}
        </h3>
        <button
          onClick={() => { onClose(); setEditId(null) }}
          className="btn-ghost h-7 w-7 p-0 text-muted-foreground"
        >
          <X size={15} />
        </button>
      </div>

      <Field label="Description">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, Groceries…"
          className="input"
        />
      </Field>

      <div className="flex gap-2">
        <Field label="Amount">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input"
          />
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        {currency !== "EUR" && (
          <Field label="Rate">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="1.00"
              className="input w-20"
            />
          </Field>
        )}
      </div>

      <div className="flex gap-2">
        <Field label="Paid by">
          <select value={paidById} onChange={(e) => setPaidById(e.target.value)} className="select">
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Split</span>
        <div className="flex gap-1">
          {SPLIT_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setSplitMode(m.value)}
              className={`flex-1 h-8 rounded-md text-xs font-medium border transition-colors ${
                splitMode === m.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {splitMode !== "equal" && (
          <div className="space-y-1.5 pt-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-sm text-foreground w-24 truncate shrink-0">{m.name}</span>
                <input
                  type="number"
                  value={splits[m.id] ?? "0"}
                  onChange={(e) => setSplits((s) => ({ ...s, [m.id]: e.target.value }))}
                  className="input"
                />
                {splitMode === "percentage" && (
                  <span className="text-xs text-muted-foreground shrink-0">%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={() => { onClose(); setEditId(null) }}
          className="btn-ghost text-muted-foreground"
        >
          Cancel
        </button>
        <button onClick={submit} className="btn-primary">
          {existing ? "Save" : "Add"}
        </button>
      </div>
    </div>
  )
}
