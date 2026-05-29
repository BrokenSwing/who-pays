import type { MemberBalance } from "./balance.ts"

export type Transfer = {
  fromMemberId: string
  fromMemberName: string
  toMemberId: string
  toMemberName: string
  amount: number
}

export function minimizeCashFlow(balances: readonly MemberBalance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ ...b, remaining: b.net }))
    .sort((a, b) => b.remaining - a.remaining)

  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ ...b, remaining: -b.net }))
    .sort((a, b) => b.remaining - a.remaining)

  const transfers: Transfer[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]!
    const debtor = debtors[di]!
    const amount = Math.min(creditor.remaining, debtor.remaining)

    transfers.push({
      fromMemberId: debtor.memberId,
      fromMemberName: debtor.memberName,
      toMemberId: creditor.memberId,
      toMemberName: creditor.memberName,
      amount: Math.round(amount * 100) / 100,
    })

    creditor.remaining -= amount
    debtor.remaining -= amount

    if (creditor.remaining < 0.005) ci++
    if (debtor.remaining < 0.005) di++
  }

  return transfers
}
