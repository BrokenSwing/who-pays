import * as Atom from "@effect-atom/atom/Atom"

export type ExpenseDraft = {
  description: string
  amount: string
  currency: string
  exchangeRate: string
  paidByMemberId: string
  splitMode: "equal" | "percentage" | "exact" | "shares"
  date: string
  splits: Record<string, string>
}

export const emptyDraft = (): ExpenseDraft => ({
  description: "",
  amount: "",
  currency: "EUR",
  exchangeRate: "1",
  paidByMemberId: "",
  splitMode: "equal",
  date: new Date().toISOString().slice(0, 10),
  splits: {},
})

export const expenseDraft = Atom.make<ExpenseDraft>(emptyDraft())
export const showAddMember = Atom.make(false)
export const showAddExpense = Atom.make(false)
export const editingExpenseId = Atom.make<string | null>(null)
