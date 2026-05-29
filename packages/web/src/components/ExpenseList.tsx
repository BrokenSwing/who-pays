import type { Store } from "@livestore/livestore"
import { events } from "@who-pays/shared"
import { useAtomSet } from "@effect-atom/atom-react"
import { editingExpenseId, showAddExpense } from "../atoms"
import { Pencil, Trash2 } from "lucide-react"

type Member = { id: string; name: string }
type Expense = {
  id: string
  description: string
  amount: number
  currency: string
  paidByMemberId: string
  date: Date
  splitMode: string
  deletedAt: Date | null
}
type Split = { expenseId: string; memberId: string; value: number }

export function ExpenseList({
  expenses,
  members,
  splits,
  store,
}: {
  expenses: readonly Expense[]
  members: readonly Member[]
  splits: readonly Split[]
  store: Store
}) {
  const setEditId = useAtomSet(editingExpenseId)
  const setAddExpense = useAtomSet(showAddExpense)

  function deleteExpense(id: string) {
    store.commit(events.expenseDeleted({ id }))
  }

  if (expenses.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-10">
        No expenses yet. Add one to get started.
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
      {expenses.map((e, i) => {
        const payer = members.find((m) => m.id === e.paidByMemberId)
        const date = e.date instanceof Date ? e.date : new Date(e.date as any)
        return (
          <div
            key={e.id}
            className={`flex items-center justify-between px-4 py-3 ${i < expenses.length - 1 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {payer?.name ?? "?"} · {e.currency} {e.amount.toFixed(2)} · {date.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
              <button
                onClick={() => {
                  setEditId(e.id)
                  setAddExpense(false)
                }}
                className="btn-ghost h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deleteExpense(e.id)}
                className="btn-ghost h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
