import { createFileRoute, Outlet } from "@tanstack/react-router"
import { LiveStoreProvider } from "@livestore/react"
import { unstable_batchedUpdates } from "react-dom"
import { schema } from "@who-pays/shared"
import { adapter } from "../../adapter"
import { GroupInit } from "../../components/GroupInit"

export const Route = createFileRoute("/g/$groupToken")({
  component: GroupRoute,
})

function GroupRoute() {
  const { groupToken } = Route.useParams()

  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      storeId={groupToken}
      batchUpdates={unstable_batchedUpdates}
      renderLoading={() => (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading…
        </div>
      )}
      renderError={(e) => (
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {String(e)}
        </div>
      )}
    >
      <GroupInit groupToken={groupToken} />
      <Outlet />
    </LiveStoreProvider>
  )
}
