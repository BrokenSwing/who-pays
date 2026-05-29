import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { LiveStoreProvider } from "@livestore/react"
import { unstable_batchedUpdates } from "react-dom"
import { schema } from "@who-pays/shared"
import { useState, useCallback } from "react"
import { adapter } from "../../adapter"
import { GroupInit } from "../../components/GroupInit"
import { CurrentMemberContext } from "../../context"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Route = createFileRoute("/g/$groupToken")({
  beforeLoad: ({ params }) => {
    if (!UUID_PATTERN.test(params.groupToken)) {
      throw redirect({ to: "/" })
    }
  },
  component: GroupRoute,
})

function GroupRoute() {
  const { groupToken } = Route.useParams()

  const [currentMemberId, setCurrentMemberId] = useState<string | null>(() =>
    localStorage.getItem(`who-pays:member:${groupToken}`)
  )

  const handleMemberSelected = useCallback(
    (id: string) => {
      localStorage.setItem(`who-pays:member:${groupToken}`, id)
      setCurrentMemberId(id)
    },
    [groupToken],
  )

  return (
    <CurrentMemberContext.Provider value={{ currentMemberId, setCurrentMemberId: handleMemberSelected }}>
      <LiveStoreProvider
        schema={schema}
        adapter={adapter}
        storeId={groupToken}
        batchUpdates={unstable_batchedUpdates}
        renderLoading={() => (
          <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        )}
        renderError={(e) => (
          <div className="min-h-screen flex items-center justify-center text-destructive text-sm">
            {String(e)}
          </div>
        )}
      >
        <GroupInit
          groupToken={groupToken}
          currentMemberId={currentMemberId}
          onMemberSelected={handleMemberSelected}
        >
          <Outlet />
        </GroupInit>
      </LiveStoreProvider>
    </CurrentMemberContext.Provider>
  )
}
