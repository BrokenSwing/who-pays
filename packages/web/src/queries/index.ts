import { queryDb } from "@livestore/livestore";
import { tables, events } from "@who-pays/shared";

export const groupQuery$ = queryDb(tables.groups.first({ fallback: () => null }));

export const membersQuery$ = queryDb(
  tables.members.where({ deletedAt: null }).orderBy("createdAt", "asc"),
);

export const expensesQuery$ = queryDb(
  tables.expenses.where({ deletedAt: null }).orderBy("date", "desc"),
);

export const splitsQuery$ = queryDb(tables.expense_splits);

export const settlementsQuery$ = queryDb(
  tables.settlements.where({ deletedAt: null }).orderBy("date", "desc"),
);
