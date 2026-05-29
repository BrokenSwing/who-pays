import type { Store } from "@livestore/livestore";
import { events } from "@who-pays/shared";
import { useAtomSet } from "@effect-atom/atom-react";
import { editingExpenseId, showAddExpense } from "../atoms";

type Member = { id: string; name: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidByMemberId: string;
  date: Date;
  splitMode: string;
  deletedAt: Date | null;
};
type Split = { expenseId: string; memberId: string; value: number };

export function ExpenseList({
  expenses,
  members,
  splits,
  store,
}: {
  expenses: readonly Expense[];
  members: readonly Member[];
  splits: readonly Split[];
  store: Store;
}) {
  const setEditId = useAtomSet(editingExpenseId);
  const setAddExpense = useAtomSet(showAddExpense);

  function deleteExpense(id: string) {
    store.commit(events.expenseDeleted({ id }));
  }

  if (expenses.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-8">
        No expenses yet. Add one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((e) => {
        const payer = members.find((m) => m.id === e.paidByMemberId);
        return (
          <div
            key={e.id}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">{e.description}</p>
              <p className="text-xs text-gray-500">
                {payer?.name ?? "?"} paid {e.currency} {e.amount.toFixed(2)} ·{" "}
                {e.date instanceof Date
                  ? e.date.toLocaleDateString()
                  : new Date(e.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              <button
                onClick={() => {
                  setEditId(e.id);
                  setAddExpense(false);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteExpense(e.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
