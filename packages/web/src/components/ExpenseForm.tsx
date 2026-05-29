import type { Store } from "@livestore/livestore";
import { nanoid } from "@livestore/livestore";
import { events } from "@who-pays/shared";
import { useState, useEffect } from "react";
import { useAtomSet } from "@effect-atom/atom-react";
import { editingExpenseId } from "../atoms";
import { useCurrentMember } from "../context";

type Member = { id: string; name: string };
type ExistingExpense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  paidByMemberId: string;
  splitMode: string;
  date: Date;
} | null;

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD"];
const SPLIT_MODES = [
  { value: "equal", label: "Equal" },
  { value: "percentage", label: "%" },
  { value: "exact", label: "Exact" },
  { value: "shares", label: "Shares" },
] as const;

export function ExpenseForm({
  members,
  groupToken,
  store,
  existing,
  onClose,
}: {
  members: readonly Member[];
  groupToken: string;
  store: Store;
  existing: ExistingExpense;
  onClose: () => void;
}) {
  const setEditId = useAtomSet(editingExpenseId);
  const { currentMemberId } = useCurrentMember();
  const today = new Date().toISOString().slice(0, 10);

  const [description, setDescription] = useState(existing?.description ?? "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [currency, setCurrency] = useState(existing?.currency ?? "EUR");
  const [exchangeRate, setExchangeRate] = useState(existing ? String(existing.exchangeRate) : "1");
  const [paidById, setPaidById] = useState(
    existing?.paidByMemberId ?? currentMemberId ?? members[0]?.id ?? "",
  );
  const [splitMode, setSplitMode] = useState<"equal" | "percentage" | "exact" | "shares">(
    (existing?.splitMode as any) ?? "equal",
  );
  const [date, setDate] = useState(
    existing
      ? existing.date instanceof Date
        ? existing.date.toISOString().slice(0, 10)
        : new Date(existing.date as any).toISOString().slice(0, 10)
      : today,
  );
  const [splits, setSplits] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const m of members) defaults[m.id] = "1";
    return defaults;
  });

  useEffect(() => {
    if (splitMode === "equal") {
      setSplits(() => {
        const s: Record<string, string> = {};
        for (const m of members) s[m.id] = "1";
        return s;
      });
    } else if (splitMode === "percentage") {
      setSplits(() => {
        const pct = members.length > 0 ? String(Math.round(100 / members.length)) : "0";
        const s: Record<string, string> = {};
        for (const m of members) s[m.id] = pct;
        return s;
      });
    } else {
      setSplits((prev) => {
        const s: Record<string, string> = {};
        for (const m of members) s[m.id] = prev[m.id] ?? "0";
        return s;
      });
    }
  }, [splitMode]);

  function validate(): string | null {
    if (!description.trim()) return "Description is required";
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return "Amount must be positive";
    if (!paidById) return "Select who paid";
    if (splitMode === "percentage") {
      const total = Object.values(splits).reduce((s, v) => s + parseFloat(v || "0"), 0);
      if (Math.abs(total - 100) > 0.01)
        return `Percentages must sum to 100 (currently ${total.toFixed(1)})`;
    }
    return null;
  }

  function submit() {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const parsedSplits = Object.entries(splits)
      .filter(([, v]) => parseFloat(v || "0") !== 0)
      .map(([memberId, value]) => ({ memberId, value: parseFloat(value) }));

    if (existing) {
      store.commit(
        events.expenseUpdated({
          id: existing.id,
          description: description.trim(),
          amount: parseFloat(amount),
          currency,
          exchangeRate: parseFloat(exchangeRate),
          paidByMemberId: paidById,
          splitMode,
          date: new Date(date).getTime(),
          splits: parsedSplits,
        }),
      );
      setEditId(null);
    } else {
      store.commit(
        events.expenseCreated({
          id: nanoid(),
          groupId: groupToken,
          description: description.trim(),
          amount: parseFloat(amount),
          currency,
          exchangeRate: parseFloat(exchangeRate),
          paidByMemberId: paidById,
          splitMode,
          date: new Date(date).getTime(),
          splits: parsedSplits,
        }),
      );
    }
    onClose();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <h3 className="font-semibold text-gray-800">{existing ? "Edit expense" : "Add expense"}</h3>

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none"
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {currency !== "EUR" && (
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="Rate"
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Paid by</label>
          <select
            value={paidById}
            onChange={(e) => setPaidById(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Split</label>
        <div className="flex gap-1 mb-2">
          {SPLIT_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setSplitMode(m.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                splitMode === m.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {splitMode !== "equal" && (
          <div className="space-y-1.5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-sm text-gray-700 w-24 truncate">{m.name}</span>
                <input
                  type="number"
                  value={splits[m.id] ?? "0"}
                  onChange={(e) => setSplits((s) => ({ ...s, [m.id]: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                />
                {splitMode === "percentage" && <span className="text-xs text-gray-400">%</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={() => {
            onClose();
            setEditId(null);
          }}
          className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700"
        >
          {existing ? "Save" : "Add"}
        </button>
      </div>
    </div>
  );
}
