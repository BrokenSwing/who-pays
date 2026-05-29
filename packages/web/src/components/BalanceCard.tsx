import type { MemberBalance, Transfer } from "@who-pays/shared"

export function BalanceCard({
  balances,
  members,
  transfers,
}: {
  balances: readonly MemberBalance[]
  members: readonly { id: string; name: string }[]
  transfers: readonly Transfer[]
}) {
  if (members.length === 0) return null

  return (
    <section>
      <h2 className="font-semibold text-gray-800 mb-3">Balances</h2>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {balances.map((b) => (
          <div key={b.memberId} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-700">{b.memberName}</span>
            <span
              className={`text-sm font-medium tabular-nums ${
                b.net > 0 ? "text-green-600" : b.net < 0 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {b.net > 0 ? "+" : ""}
              {b.net.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {transfers.length > 0 && (
        <>
          <h2 className="font-semibold text-gray-800 mb-3 mt-4">Suggested transfers</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">
                  {t.fromMemberName} → {t.toMemberName}
                </span>
                <span className="text-sm font-medium tabular-nums text-gray-700">
                  {t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
