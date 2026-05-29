import { Events } from "@livestore/livestore"
import * as Schema from "effect/Schema"

const Split = Schema.Struct({
  memberId: Schema.String,
  value: Schema.Number,
})

export const events = {
  groupCreated: Events.synced({
    name: "v1.GroupCreated",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      defaultCurrency: Schema.String,
    }),
  }),

  groupRenamed: Events.synced({
    name: "v1.GroupRenamed",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
    }),
  }),

  memberAdded: Events.synced({
    name: "v1.MemberAdded",
    schema: Schema.Struct({
      id: Schema.String,
      groupId: Schema.String,
      name: Schema.String,
    }),
  }),

  memberRenamed: Events.synced({
    name: "v1.MemberRenamed",
    schema: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
    }),
  }),

  memberRemoved: Events.synced({
    name: "v1.MemberRemoved",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),

  expenseCreated: Events.synced({
    name: "v1.ExpenseCreated",
    schema: Schema.Struct({
      id: Schema.String,
      groupId: Schema.String,
      description: Schema.String,
      amount: Schema.Number,
      currency: Schema.String,
      exchangeRate: Schema.Number,
      paidByMemberId: Schema.String,
      splitMode: Schema.Literal("equal", "percentage", "exact", "shares"),
      date: Schema.Number,
      splits: Schema.Array(Split),
    }),
  }),

  expenseUpdated: Events.synced({
    name: "v1.ExpenseUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      description: Schema.optionalWith(Schema.String, { exact: true }),
      amount: Schema.optionalWith(Schema.Number, { exact: true }),
      currency: Schema.optionalWith(Schema.String, { exact: true }),
      exchangeRate: Schema.optionalWith(Schema.Number, { exact: true }),
      paidByMemberId: Schema.optionalWith(Schema.String, { exact: true }),
      splitMode: Schema.optionalWith(
        Schema.Literal("equal", "percentage", "exact", "shares"),
        { exact: true }
      ),
      date: Schema.optionalWith(Schema.Number, { exact: true }),
      splits: Schema.optionalWith(Schema.Array(Split), { exact: true }),
    }),
  }),

  expenseDeleted: Events.synced({
    name: "v1.ExpenseDeleted",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),

  settlementCreated: Events.synced({
    name: "v1.SettlementCreated",
    schema: Schema.Struct({
      id: Schema.String,
      groupId: Schema.String,
      fromMemberId: Schema.String,
      toMemberId: Schema.String,
      amount: Schema.Number,
      currency: Schema.String,
      date: Schema.Number,
    }),
  }),

  settlementDeleted: Events.synced({
    name: "v1.SettlementDeleted",
    schema: Schema.Struct({
      id: Schema.String,
    }),
  }),
}
