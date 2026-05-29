import { materializers } from "@livestore/livestore"
import { events } from "./events.ts"
import { tables } from "./tables.ts"

export const appMaterializers = materializers(events, {
  "v1.GroupCreated": ({ id, name, defaultCurrency }) =>
    tables.groups.insert({
      id,
      name,
      defaultCurrency,
      createdAt: new Date(),
    }),

  "v1.GroupRenamed": ({ id, name }) =>
    tables.groups.update({ name }).where({ id }),

  "v1.MemberAdded": ({ id, groupId, name }) =>
    tables.members.insert({
      id,
      groupId,
      name,
      createdAt: new Date(),
      deletedAt: null,
    }),

  "v1.MemberRenamed": ({ id, name }) =>
    tables.members.update({ name }).where({ id }),

  "v1.MemberRemoved": ({ id }) =>
    tables.members.update({ deletedAt: new Date() }).where({ id }),

  "v1.ExpenseCreated": ({ id, groupId, description, amount, currency, exchangeRate, paidByMemberId, splitMode, date, splits }) => [
    tables.expenses.insert({
      id,
      groupId,
      description,
      amount,
      currency,
      exchangeRate,
      paidByMemberId,
      splitMode,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }),
    ...splits.map((split) =>
      tables.expense_splits.insert({
        id: `${id}:${split.memberId}`,
        expenseId: id,
        memberId: split.memberId,
        value: split.value,
      })
    ),
  ],

  "v1.ExpenseUpdated": ({ id, description, amount, currency, exchangeRate, paidByMemberId, splitMode, date, splits }) => {
    const ops: ReturnType<typeof tables.expenses.update>[] | ReturnType<typeof tables.expense_splits.insert>[] = []

    const patch: Record<string, unknown> = { updatedAt: new Date() }
    if (description !== undefined) patch.description = description
    if (amount !== undefined) patch.amount = amount
    if (currency !== undefined) patch.currency = currency
    if (exchangeRate !== undefined) patch.exchangeRate = exchangeRate
    if (paidByMemberId !== undefined) patch.paidByMemberId = paidByMemberId
    if (splitMode !== undefined) patch.splitMode = splitMode
    if (date !== undefined) patch.date = new Date(date)

    ops.push(tables.expenses.update(patch).where({ id }) as any)

    if (splits !== undefined) {
      ops.push(tables.expense_splits.delete().where({ expenseId: id }) as any)
      for (const split of splits) {
        ops.push(
          tables.expense_splits.insert({
            id: `${id}:${split.memberId}`,
            expenseId: id,
            memberId: split.memberId,
            value: split.value,
          }) as any
        )
      }
    }

    return ops as any
  },

  "v1.ExpenseDeleted": ({ id }) =>
    tables.expenses.update({ deletedAt: new Date() }).where({ id }),

  "v1.SettlementCreated": ({ id, groupId, fromMemberId, toMemberId, amount, currency, date }) =>
    tables.settlements.insert({
      id,
      groupId,
      fromMemberId,
      toMemberId,
      amount,
      currency,
      date: new Date(date),
      deletedAt: null,
    }),

  "v1.SettlementDeleted": ({ id }) =>
    tables.settlements.update({ deletedAt: new Date() }).where({ id }),
})
