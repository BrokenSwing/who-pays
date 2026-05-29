import type { MemberBalance, Transfer } from "@who-pays/shared"
import { ArrowRight } from "lucide-react"

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
    <div className="space-y-4">
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">Balances</h2>
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
          {balances.map((b, i) => (
            <div
              key={b.memberId}
              className={`flex items-center justify-between px-4 py-2.5 ${i < balances.length - 1 ? "border-b border-border" : ""}`}
            >
              <span className="text-sm text-foreground">{b.memberName}</span>
              <span
                className={`text-sm font-medium tabular-nums ${
                  b.net > 0
                    ? "text-primary"
                    : b.net < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {b.net > 0 ? "+" : ""}
                {b.net.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {transfers.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Suggested transfers</h2>
          <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
            {transfers.map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 ${i < transfers.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-sm text-foreground flex items-center gap-1.5">
                  {t.fromMemberName}
                  <ArrowRight size={13} className="text-muted-foreground shrink-0" />
                  {t.toMemberName}
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
