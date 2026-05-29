import { State } from "@livestore/livestore";

export const groups = State.SQLite.table({
  name: "groups",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    name: State.SQLite.text({ default: "" }),
    defaultCurrency: State.SQLite.text({ default: "EUR" }),
    createdAt: State.SQLite.datetime(),
  },
});

export const members = State.SQLite.table({
  name: "members",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    groupId: State.SQLite.text({ default: "" }),
    name: State.SQLite.text({ default: "" }),
    createdAt: State.SQLite.datetime(),
    deletedAt: State.SQLite.datetime({ nullable: true }),
  },
});

export const expenses = State.SQLite.table({
  name: "expenses",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    groupId: State.SQLite.text({ default: "" }),
    description: State.SQLite.text({ default: "" }),
    amount: State.SQLite.real({ default: 0 }),
    currency: State.SQLite.text({ default: "EUR" }),
    exchangeRate: State.SQLite.real({ default: 1 }),
    paidByMemberId: State.SQLite.text({ default: "" }),
    splitMode: State.SQLite.text({ default: "equal" }),
    date: State.SQLite.datetime(),
    createdAt: State.SQLite.datetime(),
    updatedAt: State.SQLite.datetime(),
    deletedAt: State.SQLite.datetime({ nullable: true }),
  },
});

export const expense_splits = State.SQLite.table({
  name: "expense_splits",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    expenseId: State.SQLite.text({ default: "" }),
    memberId: State.SQLite.text({ default: "" }),
    value: State.SQLite.real({ default: 0 }),
  },
});

export const settlements = State.SQLite.table({
  name: "settlements",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    groupId: State.SQLite.text({ default: "" }),
    fromMemberId: State.SQLite.text({ default: "" }),
    toMemberId: State.SQLite.text({ default: "" }),
    amount: State.SQLite.real({ default: 0 }),
    currency: State.SQLite.text({ default: "EUR" }),
    date: State.SQLite.datetime(),
    deletedAt: State.SQLite.datetime({ nullable: true }),
  },
});

export const tables = { groups, members, expenses, expense_splits, settlements };
