# Who Pays?

A local-first expense-splitting app. Track shared expenses and settle up fairly — no accounts required, just share a link.

## Features

- Create a group and share the URL — anyone with the link can join
- Add expenses with equal, percentage, exact, or shares-based splits
- Multi-currency support with exchange rates
- Automatic settlement suggestions (minimum number of transfers)
- Full audit log of every expense change
- Works offline; syncs when back online

## Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | React + Vite + TanStack Router + Tailwind CSS v4         |
| State    | LiveStore (local-first, event-sourced, OPFS persistence) |
| Sync     | `@effect/rpc` over WebSocket                             |
| Backend  | Effect + `@effect/sql-sqlite-node`                       |
| Monorepo | pnpm workspaces                                          |

## Packages

- **`@who-pays/shared`** — LiveStore schema, RPC contract, balance and settlement logic
- **`@who-pays/api`** — WebSocket sync server on port 3000
- **`@who-pays/web`** — React frontend on port 5173

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Other commands

```bash
pnpm typecheck      # type-check all packages
pnpm build          # production build
pnpm lint           # oxlint
pnpm format         # oxfmt (write)
pnpm format:check   # oxfmt (check only)
```
