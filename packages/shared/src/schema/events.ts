import { Events } from "@livestore/livestore"
import * as Schema from "effect/Schema"

const Id = Schema.String.pipe(Schema.maxLength(64))
const Name = Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100))
const CurrencyCode = Schema.String.pipe(Schema.minLength(1), Schema.maxLength(10))
const Description = Schema.String.pipe(Schema.maxLength(500))
const PositiveAmount = Schema.Number.pipe(Schema.positive())
const PositiveRate = Schema.Number.pipe(Schema.positive())

const Split = Schema.Struct({
  memberId: Id,
  value: Schema.Number,
})

export const events = {
  groupCreated: Events.synced({
    name: "v1.GroupCreated",
    schema: Schema.Struct({
      id: Id,
      name: Name,
      defaultCurrency: CurrencyCode,
    }),
  }),

  groupRenamed: Events.synced({
    name: "v1.GroupRenamed",
    schema: Schema.Struct({
      id: Id,
      name: Name,
    }),
  }),

  memberAdded: Events.synced({
    name: "v1.MemberAdded",
    schema: Schema.Struct({
      id: Id,
      groupId: Id,
      name: Name,
    }),
  }),

  memberRenamed: Events.synced({
    name: "v1.MemberRenamed",
    schema: Schema.Struct({
      id: Id,
      name: Name,
    }),
  }),

  memberRemoved: Events.synced({
    name: "v1.MemberRemoved",
    schema: Schema.Struct({
      id: Id,
    }),
  }),

  expenseCreated: Events.synced({
    name: "v1.ExpenseCreated",
    schema: Schema.Struct({
      id: Id,
      groupId: Id,
      description: Description,
      amount: PositiveAmount,
      currency: CurrencyCode,
      exchangeRate: PositiveRate,
      paidByMemberId: Id,
      splitMode: Schema.Literal("equal", "percentage", "exact", "shares"),
      date: Schema.Number,
      splits: Schema.Array(Split),
    }),
  }),

  expenseUpdated: Events.synced({
    name: "v1.ExpenseUpdated",
    schema: Schema.Struct({
      id: Id,
      description: Schema.optionalWith(Description, { exact: true }),
      amount: Schema.optionalWith(PositiveAmount, { exact: true }),
      currency: Schema.optionalWith(CurrencyCode, { exact: true }),
      exchangeRate: Schema.optionalWith(PositiveRate, { exact: true }),
      paidByMemberId: Schema.optionalWith(Id, { exact: true }),
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
      id: Id,
    }),
  }),

  settlementCreated: Events.synced({
    name: "v1.SettlementCreated",
    schema: Schema.Struct({
      id: Id,
      groupId: Id,
      fromMemberId: Id,
      toMemberId: Id,
      amount: PositiveAmount,
      currency: CurrencyCode,
      date: Schema.Number,
    }),
  }),

  settlementDeleted: Events.synced({
    name: "v1.SettlementDeleted",
    schema: Schema.Struct({
      id: Id,
    }),
  }),
}

export const KNOWN_EVENT_NAMES = new Set([
  "v1.GroupCreated",
  "v1.GroupRenamed",
  "v1.MemberAdded",
  "v1.MemberRenamed",
  "v1.MemberRemoved",
  "v1.ExpenseCreated",
  "v1.ExpenseUpdated",
  "v1.ExpenseDeleted",
  "v1.SettlementCreated",
  "v1.SettlementDeleted",
])
