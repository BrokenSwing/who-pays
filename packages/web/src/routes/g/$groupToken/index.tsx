import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useStore } from "@livestore/react"
import { membersQuery$, expensesQuery$, splitsQuery$, settlementsQuery$, groupQuery$ } from "../../../queries"
import { computeBalances, minimizeCashFlow } from "@who-pays/shared"
import { MembersCard } from "../../../components/MembersCard"
import { ExpenseList } from "../../../components/ExpenseList"
import { ExpenseForm } from "../../../components/ExpenseForm"
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { showAddExpense, editingExpenseId } from "../../../atoms"
import { upsertGroup } from "../../../storage"
import { useEffect } from "react"
import { ChevronLeft, Link2, Plus } from "lucide-react"

export const Route = createFileRoute("/g/$groupToken/")({
  component: GroupPage,
})

function GroupPage() {
  const { groupToken } = Route.useParams()
  const navigate = useNavigate()
  const members = useQuery(membersQuery$)
  const expenses = useQuery(expensesQuery$)
  const splits = useQuery(splitsQuery$)
  const settlements = useQuery(settlementsQuery$)
  const group = useQuery(groupQuery$)
  const { store } = useStore()

  const addExpenseVisible = useAtomValue(showAddExpense)
  const setAddExpense = useAtomSet(showAddExpense)
  const editId = useAtomValue(editingExpenseId)
  const setEditId = useAtomSet(editingExpenseId)

  // Persist this group in the local group list whenever we know its name
  useEffect(() => {
    if (group) upsertGroup(group.id, group.name)
  }, [group?.id, group?.name])

  const balances = computeBalances(members, expenses, splits, settlements)
  const transfers = minimizeCashFlow(balances)
  const existingExpense = editId ? (expenses.find((e) => e.id === editId) ?? null) : null
  const showForm = addExpenseVisible || editId !== null

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky mobile header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-2 h-13 flex items-center gap-1">
          <button
            onClick={() => navigate({ to: "/" })}
            className="btn-ghost h-9 w-9 p-0 text-muted-foreground shrink-0"
            aria-label="Back to groups"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="flex-1 text-sm font-semibold text-foreground truncate px-1">
            {group?.name ?? "…"}
          </span>

          <button onClick={copyLink} className="btn-ghost h-9 w-9 p-0 text-muted-foreground shrink-0" aria-label="Copy invite link">
            <Link2 size={17} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        <MembersCard
          members={members}
          balances={balances}
          transfers={transfers}
          store={store}
          groupToken={groupToken}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Expenses</h2>
            <button
              onClick={() => { setAddExpense(true); setEditId(null) }}
              className="btn-primary h-8 px-3 gap-1.5 text-xs"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {showForm && (
            <ExpenseForm
              members={members}
              groupToken={groupToken}
              store={store}
              existing={existingExpense as any}
              onClose={() => { setAddExpense(false); setEditId(null) }}
            />
          )}

          <ExpenseList expenses={expenses} members={members} splits={splits} store={store} />
        </section>
      </div>
    </div>
  )
}
