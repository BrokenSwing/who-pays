import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useStore } from "@livestore/react"
import { membersQuery$, expensesQuery$, splitsQuery$, settlementsQuery$ } from "../../../queries"
import { computeBalances, minimizeCashFlow } from "@who-pays/shared"
import { MemberList } from "../../../components/MemberList"
import { ExpenseList } from "../../../components/ExpenseList"
import { BalanceCard } from "../../../components/BalanceCard"
import { ExpenseForm } from "../../../components/ExpenseForm"
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { showAddExpense, editingExpenseId } from "../../../atoms"
import { Logo } from "../../../components/Logo"
import { Link2, Plus } from "lucide-react"

export const Route = createFileRoute("/g/$groupToken/")({
  component: GroupPage,
})

function GroupPage() {
  const { groupToken } = Route.useParams()
  const members = useQuery(membersQuery$)
  const expenses = useQuery(expensesQuery$)
  const splits = useQuery(splitsQuery$)
  const settlements = useQuery(settlementsQuery$)
  const { store } = useStore()

  const addExpenseVisible = useAtomValue(showAddExpense)
  const setAddExpense = useAtomSet(showAddExpense)
  const editId = useAtomValue(editingExpenseId)
  const setEditId = useAtomSet(editingExpenseId)

  const balances = computeBalances(members, expenses, splits, settlements)
  const transfers = minimizeCashFlow(balances)
  const existingExpense = editId ? (expenses.find((e) => e.id === editId) ?? null) : null
  const showForm = addExpenseVisible || editId !== null

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="text-base font-semibold text-foreground">Who Pays?</span>
          </div>
          <button onClick={copyLink} className="btn-outline gap-1.5">
            <Link2 size={14} />
            Copy invite link
          </button>
        </header>

        <MemberList members={members} store={store} groupToken={groupToken} />

        <BalanceCard balances={balances} members={members} transfers={transfers} />

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
