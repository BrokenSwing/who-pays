import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useStore } from "@livestore/react"
import { events } from "@who-pays/shared"
import { membersQuery$, expensesQuery$, splitsQuery$, settlementsQuery$ } from "../../../queries"
import { computeBalances, minimizeCashFlow } from "@who-pays/shared"
import { MemberList } from "../../../components/MemberList"
import { ExpenseList } from "../../../components/ExpenseList"
import { BalanceCard } from "../../../components/BalanceCard"
import { ExpenseForm } from "../../../components/ExpenseForm"
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { showAddExpense, editingExpenseId } from "../../../atoms"

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

  const existingExpense = editId ? expenses.find((e) => e.id === editId) ?? null : null

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  const showForm = addExpenseVisible || editId !== null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Who Pays?</h1>
          <button onClick={copyLink} className="text-sm text-blue-600 hover:underline">
            Copy invite link
          </button>
        </header>

        <MemberList members={members} store={store} groupToken={groupToken} />

        <BalanceCard balances={balances} members={members} transfers={transfers} />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Expenses</h2>
            <button
              onClick={() => setAddExpense(true)}
              className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add
            </button>
          </div>

          {showForm && (
            <ExpenseForm
              members={members}
              groupToken={groupToken}
              store={store}
              existing={existingExpense as any}
              onClose={() => {
                setAddExpense(false)
                setEditId(null)
              }}
            />
          )}

          <ExpenseList expenses={expenses} members={members} splits={splits} store={store} />
        </section>
      </div>
    </div>
  )
}
