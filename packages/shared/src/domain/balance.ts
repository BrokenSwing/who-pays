export type MemberBalance = {
  memberId: string;
  memberName: string;
  net: number;
};

type Member = { id: string; name: string; deletedAt: Date | null };
type Expense = {
  id: string;
  amount: number;
  exchangeRate: number;
  paidByMemberId: string;
  splitMode: string;
  deletedAt: Date | null;
};
type Split = { expenseId: string; memberId: string; value: number };
type Settlement = {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  deletedAt: Date | null;
};

function splitShare(
  amountInBase: number,
  value: number,
  totalShares: number,
  splitMode: string,
): number {
  switch (splitMode) {
    case "equal":
      return amountInBase / totalShares;
    case "percentage":
      return amountInBase * (value / 100);
    case "exact":
      return value;
    case "shares":
      return amountInBase * (value / totalShares);
    default:
      return 0;
  }
}

export function computeBalances(
  members: readonly Member[],
  expenses: readonly Expense[],
  splits: readonly Split[],
  settlements: readonly Settlement[],
): MemberBalance[] {
  const net = new Map<string, number>();
  for (const m of members) {
    net.set(m.id, 0);
  }

  for (const expense of expenses) {
    if (expense.deletedAt !== null) continue;
    const amountInBase = expense.amount * expense.exchangeRate;

    // Credit the payer
    const payerBalance = net.get(expense.paidByMemberId) ?? 0;
    net.set(expense.paidByMemberId, payerBalance + amountInBase);

    const expenseSplits = splits.filter((s) => s.expenseId === expense.id);
    if (expenseSplits.length === 0) continue;

    const totalShares =
      expense.splitMode === "shares" || expense.splitMode === "equal"
        ? expenseSplits.reduce((sum, s) => sum + s.value, 0)
        : 1;

    for (const split of expenseSplits) {
      const share = splitShare(amountInBase, split.value, totalShares, expense.splitMode);
      const memberBalance = net.get(split.memberId) ?? 0;
      net.set(split.memberId, memberBalance - share);
    }
  }

  // Apply settlements
  for (const s of settlements) {
    if (s.deletedAt !== null) continue;
    const from = net.get(s.fromMemberId) ?? 0;
    const to = net.get(s.toMemberId) ?? 0;
    net.set(s.fromMemberId, from + s.amount);
    net.set(s.toMemberId, to - s.amount);
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return members
    .filter((m) => net.has(m.id))
    .map((m) => ({
      memberId: m.id,
      memberName: m.name,
      net: Math.round((net.get(m.id) ?? 0) * 100) / 100,
    }));
}
